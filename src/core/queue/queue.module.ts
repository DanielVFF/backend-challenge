import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { EnvironmentConfigModule } from '../environment-config/environment-config.module';
import { EnvironmentConfigService } from '../environment-config/environment-config.service';
import { QueueController } from './queue.controller';

@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [EnvironmentConfigModule],
      inject: [EnvironmentConfigService],
      useFactory: (configService: EnvironmentConfigService) => {
        const connection = {
          host: configService.getRedisHost(),
          port: configService.getRedisPort(),
        };

        const password = configService.getRedisPassword();
        if (password) {
          connection['password'] = password;
        }

        return {
          connection,
        };
      },
    }),
    BullModule.registerQueue({
      name: 'email',
    }),
  ],
  providers: [QueueController],
  exports: [BullModule, QueueController],
})
export class QueueModule {}
