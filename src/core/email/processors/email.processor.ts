import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { EmailService } from '../email.service';
import { EmailJobData } from '../interfaces/email-job.interface';
import { EmailTemplate } from '../interfaces/email-template.interface';
import { WelcomeEmailTemplate } from '../templates/example-welcome.template';
import { ResetPasswordEmailTemplate } from '../templates/reset-password.template';

@Processor('email', {
  concurrency: 5,
  limiter: {
    max: 10,
    duration: 1000,
  },
})
export class EmailProcessor extends WorkerHost {
  private readonly logger = new Logger(EmailProcessor.name);

  constructor(private readonly emailService: EmailService) {
    super();
  }

  async process(job: Job<EmailJobData>): Promise<void> {
    this.logger.log(`Processing email job ${job.id} for ${job.data.to}`);

    try {
      const template = this.getTemplateInstance(job.data.template.name);
      if (!template) {
        throw new Error(`Template ${job.data.template.name} not found`);
      }

      const mockRequest = job.data.request
        ? ({
            headers: {
              'user-agent': job.data.request.userAgent || 'Unknown',
            },
            ip: job.data.request.ip,
            socket: {
              remoteAddress: job.data.request.ip,
            },
          } as any)
        : undefined;

      await this.emailService.sendEmail({
        template,
        to: job.data.to,
        templateData: job.data.templateData || {},
        subject: job.data.subject,
        request: mockRequest,
      });

      this.logger.log(`Email job ${job.id} completed successfully`);
    } catch (error) {
      this.logger.error(
        `Failed to process email job ${job.id}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    this.logger.log(`Email job ${job.id} completed`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, error: Error) {
    this.logger.error(
      `Email job ${job.id} failed: ${error.message}`,
      error.stack,
    );
  }

  private getTemplateInstance(templateName: string): EmailTemplate | null {
    const templates: Record<string, () => EmailTemplate> = {
      WelcomeEmailTemplate: () => new WelcomeEmailTemplate(),
      ResetPasswordEmailTemplate: () => new ResetPasswordEmailTemplate(),
    };

    const templateFactory = templates[templateName];
    return templateFactory ? templateFactory() : null;
  }
}
