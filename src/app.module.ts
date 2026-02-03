import { Module } from '@nestjs/common';
import { UserModule } from './modules/user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { EnvironmentConfigModule } from './core/environment-config/environment-config.module';
import { PrismaModule } from './prisma/prisma.module';
import { CacheModule } from './core/cache/cache.module';
import { AuthModule } from './core/auth/auth.module';
import { LoggerModule } from './core/logger/logger.module';
import { EmailModule } from './core/email/email.module';
import { QueueModule } from './core/queue/queue.module';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { CacheThrottlerStorage } from './core/throttler/cache-throttler.storage';
import { CacheService } from './core/cache/cache.service';
import {
  I18nJsonLoader,
  I18nModule,
  AcceptLanguageResolver,
} from 'nestjs-i18n';
import { EnvironmentConfigService } from './core/environment-config/environment-config.service';
import { TranslationInterceptor } from './core/interceptor/translation.interceptor';
import path from 'path';

@Module({
  imports: [
    UserModule,
    JwtModule,
    EnvironmentConfigModule,
    PrismaModule,
    CacheModule,
    AuthModule,
    LoggerModule,
    EmailModule,
    QueueModule,
    I18nModule.forRootAsync({
      imports: [EnvironmentConfigModule],
      inject: [EnvironmentConfigService],
      useFactory: (configService: EnvironmentConfigService) => {
        const isProduction = configService.getNodeEnv() === 'production';
        const i18nPath = isProduction
          ? path.join(process.cwd(), 'dist', 'i18n')
          : path.join(process.cwd(), 'src', '/i18n/');
        return {
          fallbackLanguage: 'en',
          loader: I18nJsonLoader,
          loaderOptions: {
            path: i18nPath,
            watch: !isProduction,
          },
        };
      },
      resolvers: [
        AcceptLanguageResolver
      ],
    }),
    ThrottlerModule.forRootAsync({
      imports: [CacheModule],
      inject: [CacheService],
      useFactory: (cacheService: CacheService) => ({
        throttlers: [
          {
            ttl: 60000,
            limit: 30,
          },
        ],
        storage: new CacheThrottlerStorage(cacheService),
      }),
    }),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TranslationInterceptor,
    },
  ],
})
export class AppModule { }
