import { Module } from '@nestjs/common';
import { CacheService } from './cache.service';
import { CacheController } from './cache.controller';
import { RedisCacheService } from './implementations/redis-cache.service';
import { MachineCacheService } from './implementations/machine-cache.service';
import { EnvironmentConfigService } from '../environment-config/environment-config.service';

@Module({
  controllers: [CacheController],
  providers: [
    CacheService,
    MachineCacheService,
    {
      provide: 'REDIS_CONFIG',
      useFactory: (configService: EnvironmentConfigService) => {
        if (!configService.isRedisEnabled()) {
          return null;
        }

        return {
          type: 'single' as const,
          options: {
            host: configService.getRedisHost(),
            port: configService.getRedisPort(),
            password: configService.getRedisPassword(),
            connectTimeout: configService.getRedisConnectionTimeout(),
            commandTimeout: 3000,
            keepAlive: 30000,
            family: 4, // IPv4
            db: 0,
          },
        };
      },
      inject: [EnvironmentConfigService],
    },
    {
      provide: RedisCacheService,
      useFactory: (redisConfig: any) => {
        if (!redisConfig) {
          return null;
        }
        return new RedisCacheService(redisConfig);
      },
      inject: ['REDIS_CONFIG'],
    },
  ],
  exports: [CacheService],
})
export class CacheModule {}
