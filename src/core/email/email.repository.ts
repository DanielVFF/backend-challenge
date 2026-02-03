import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  Prisma,
  EmailLog,
  EmailStatusEnum,
  PrismaClient,
} from '@prisma/client';

@Injectable()
export class EmailRepository {
  private readonly logger = new Logger(EmailRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  async createEmailLog(
    data: Prisma.EmailLogCreateInput,
    prisma: PrismaClient = this.prisma,
  ): Promise<EmailLog> {
    try {
      const emailLog = await prisma.emailLog.create({
        data,
      });
      return emailLog;
    } catch (error) {
      this.logger.error('Error creating email log:', error);
      throw error;
    }
  }

  async updateEmailLog(
    id: string,
    data: Prisma.EmailLogUpdateInput,
    prisma: PrismaClient = this.prisma,
  ): Promise<EmailLog> {
    try {
      const emailLog = await prisma.emailLog.update({
        where: { id },
        data,
      });
      return emailLog;
    } catch (error) {
      this.logger.error('Error updating email log:', error);
      throw error;
    }
  }

  /**
   * Marks an email as sent
   */
  async markEmailAsSent(id: string, messageId: string | null): Promise<void> {
    await this.updateEmailLog(id, {
      status: EmailStatusEnum.SENT,
      sent_at: new Date(),
      message_id: messageId,
    });
  }

  async markEmailAsFailed(id: string, errorMessage: string): Promise<void> {
    await this.updateEmailLog(id, {
      status: EmailStatusEnum.FAILED,
      error_message: errorMessage,
    });
  }

  async getEmailLogs(
    where?: Prisma.EmailLogWhereInput,
    orderBy?: Prisma.EmailLogOrderByWithRelationInput,
    take?: number,
    skip?: number,
    prisma: PrismaClient = this.prisma,
  ): Promise<EmailLog[]> {
    try {
      const emailLogs = await prisma.emailLog.findMany({
        where,
        orderBy: orderBy || { created_at: 'desc' },
        take,
        skip,
      });
      return emailLogs;
    } catch (error) {
      this.logger.error('Error getting email logs:', error);
      throw error;
    }
  }

  async getEmailLogById(
    id: string,
    prisma: PrismaClient = this.prisma,
  ): Promise<EmailLog | null> {
    try {
      const emailLog = await prisma.emailLog.findUnique({
        where: { id },
      });
      return emailLog;
    } catch (error) {
      this.logger.error('Error getting email log by ID:', error);
      throw error;
    }
  }
}
