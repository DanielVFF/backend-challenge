import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';
import { EnvironmentConfigService } from '../environment-config/environment-config.service';
import { EmailRepository } from './email.repository';
import { SendEmailOptions } from './interfaces/send-email-options.interface';
import { EmailJobData } from './interfaces/email-job.interface';
import { extractIpAddress } from '../helper/utils/extract-ip-address';
import { EmailLog, EmailStatusEnum } from '@prisma/client';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: Transporter;

  constructor(
    private readonly configService: EnvironmentConfigService,
    private readonly emailRepository: EmailRepository,
    @InjectQueue('email') private readonly emailQueue: Queue,
  ) {
    this.initializeTransporter();
  }

  private initializeTransporter(): void {
    this.transporter = nodemailer.createTransport({
      host: this.configService.getEmailHost(),
      port: this.configService.getEmailPort(),
      secure: this.configService.getEmailPort() === 465, // true for 465, false for other ports
      auth: {
        user: this.configService.getEmailUser(),
        pass: this.configService.getEmailPassword(),
      },
    });
  }

  async queueEmail(options: SendEmailOptions): Promise<void> {
    const templateName = options.template.constructor.name;
    const requesterIp = options.request
      ? extractIpAddress(options.request)
      : undefined;
    const userAgent = options.request?.headers['user-agent'] || undefined;

    const jobData: EmailJobData = {
      template: {
        name: templateName,
        data: {},
      },
      to: options.to,
      templateData: options.templateData,
      subject: options.subject,
      request: {
        ip: requesterIp,
        userAgent,
      },
    };

    await this.emailQueue.add('sendEmail', jobData, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
      removeOnComplete: {
        age: 3600,
        count: 1000,
      },
      removeOnFail: {
        age: 86400,
      },
    });
  }

  async sendEmail(options: SendEmailOptions): Promise<void> {
    const {
      template,
      to,
      templateData = {},
      subject: customSubject,
      request,
    } = options;

    const requesterIp = request ? extractIpAddress(request) : null;
    const userAgent = request?.headers['user-agent'] || null;

    const subject = customSubject || template.getSubject(templateData);
    const html = template.getHtml(templateData);
    const text = template.getText?.(templateData) || this.htmlToText(html);

    let emailLog: EmailLog;
    try {
      const emailType = this.getEmailType(template);
      emailLog = await this.emailRepository.createEmailLog({
        email_type: emailType,
        recipient: to,
        subject,
        requester_ip: requesterIp,
        user_agent: userAgent,
        status: EmailStatusEnum.PENDING,
      });
    } catch (error) {
      this.logger.error('Failed to create email log:', error);
      throw error;
    }

    try {
      const mailOptions = {
        from: `"${this.configService.getEmailFromName()}" <${this.configService.getEmailFrom()}>`,
        to,
        subject,
        text,
        html,
      };

      const info = await this.transporter.sendMail(mailOptions);

      await this.emailRepository.markEmailAsSent(
        emailLog.id,
        info?.messageId || null,
      );
    } catch (error) {
      this.logger.error(`Failed to send email: welcome to ${to}`, error);

      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      await this.emailRepository.markEmailAsFailed(emailLog.id, errorMessage);

      throw error;
    }
  }

  private htmlToText(html: string): string {
    return html
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .trim();
  }

  async verifyConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      this.logger.log('Email transporter connection verified');
      return true;
    } catch (error) {
      this.logger.error('Email transporter connection failed:', error);
      return false;
    }
  }

  private getEmailType(template: any): string {
    const templateName = template.constructor.name;
    const typeMap: Record<string, string> = {
      WelcomeEmailTemplate: 'welcome',
      ResetPasswordEmailTemplate: 'password-reset',
    };
    return typeMap[templateName] || 'unknown';
  }
}
