import { Module, forwardRef } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { ACCESS_TOKEN_TTL, AuthService } from './auth.service';
import { ConfigModule } from '@nestjs/config';
import { CacheModule } from '../cache/cache.module';
import { UserModule } from 'src/modules/user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { EnvironmentConfigService } from '../environment-config/environment-config.service';
import { GoogleModule } from './google/google.module';
import { JwtStrategy } from './auth.strategy';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [
    ConfigModule,
    forwardRef(() => UserModule),
    CacheModule,
    PassportModule,
    JwtModule.registerAsync({
      inject: [EnvironmentConfigService],
      useFactory: (configService: EnvironmentConfigService) => ({
        secret: configService.getSecretKey(),
        signOptions: { expiresIn: ACCESS_TOKEN_TTL },
      }),
    }),
    GoogleModule,
    EmailModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [PassportModule, AuthService],
})
export class AuthModule {}
