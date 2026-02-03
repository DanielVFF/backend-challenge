import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { EmailRepository } from './email.repository';
import { EmailProcessor } from './processors/email.processor';
import { PrismaModule } from '../../prisma/prisma.module';
import { EnvironmentConfigModule } from '../environment-config/environment-config.module';
import { QueueModule } from '../queue/queue.module';

@Module({
  imports: [PrismaModule, EnvironmentConfigModule, QueueModule],
  providers: [EmailService, EmailRepository, EmailProcessor],
  exports: [EmailService, EmailRepository],
})
export class EmailModule {}
