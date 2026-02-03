import {
  Injectable,
  Logger,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import {
  LoginResponseInterface,
  CodeSentResponseInterface,
} from './interfaces/auth.interface';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { VerifyDto } from './dto/verify.dto';
import { CacheService } from '../cache/cache.service';
import { UserRepository } from 'src/modules/user/user.repository';
import { comparePassword } from '../helper/utils/compare-password';
import { User } from '@prisma/client';
import { EmailService } from '../email/email.service';
import { WelcomeEmailTemplate } from '../email/templates/example-welcome.template';
import { ResetPasswordEmailTemplate } from '../email/templates/reset-password.template';
import { Request } from 'express';
import { extractIpAddress } from '../helper/utils/extract-ip-address';
import * as crypto from 'crypto';
import { getDayDiff } from '../helper/utils/get-day-diff.fn';
import { RequestPasswordResetDto } from './dto/request-password-reset.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { hashPassword } from '../helper/utils/hash-password';
import { EnvironmentConfigService } from '../environment-config/environment-config.service';

export const REFRESH_TOKEN_TTL = 60 * 60 * 24 * 7;
export const ACCESS_TOKEN_TTL = 60 * 60 * 3;
export const LOGIN_CODE_TTL = 60 * 10;
export const DAYS_FOR_CODE_VERIFICATION = 15;

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
    private readonly cacheService: CacheService,
    private readonly emailService: EmailService,
    private readonly configService: EnvironmentConfigService,
  ) {}

  async authenticateUser(
    loginData: LoginDto,
    request: Request,
    oauthLogin: boolean = false,
  ): Promise<LoginResponseInterface | CodeSentResponseInterface> {
    const user = await this.userRepository.getUserByFilter({
      email: loginData.email,
    });
    if (!user) throw new UnauthorizedException('errors.unauthorized');

    const requiresCodeVerification = await this.shouldRequireCodeVerification(
      user.id,
      request,
    );

    if (!oauthLogin) {
      await this.verifyPassword(user, loginData);
      if (requiresCodeVerification)
        return await this.sendLoginVerificationCode(user, request);
    }

    const { access_token, refresh_token } = await this.generateTokens(user);

    await this.createUserAccess(user, request, '/auth/login');

    return {
      access_token,
      refresh_token,
      user,
    };
  }

  private async sendLoginVerificationCode(
    user: User,
    request?: Request,
  ): Promise<CodeSentResponseInterface> {
    const code = this.generateLoginCode();
    const verificationHash = this.generateVerificationHash();

    await this.cacheService.set(
      `verification_hash:${verificationHash}`,
      {
        code,
        email: user.email,
        userId: user.id,
      },
      {
        ttl: LOGIN_CODE_TTL,
      },
    );

    if (request) await this.createUserAccess(user, request, '/auth/login');

    await this.emailService.queueEmail({
      template: new WelcomeEmailTemplate(),
      to: user.email,
      templateData: {
        name: user.name,
        code,
        appName: this.configService.getEmailFromName(),
      },
      request,
    });

    return {
      message: 'messages.code_sent',
      email: user.email,
      verificationHash,
    };
  }

  private async createUserAccess(user: User, request: Request, type: string) {
    const ipAddress = extractIpAddress(request);
    const userAgent = request.headers['user-agent'] || 'Unknown';
    await this.userRepository.createUserAccess(
      user.id,
      ipAddress,
      userAgent,
      type,
    );
  }

  private async shouldRequireCodeVerification(
    userId: string,
    request: Request,
  ): Promise<boolean> {
    const lastLogin = await this.userRepository.getLastLogin(userId);
    const ipAddress = extractIpAddress(request);

    return (
      !lastLogin ||
      lastLogin.ip_address != ipAddress ||
      getDayDiff(lastLogin.created_at, new Date()) > DAYS_FOR_CODE_VERIFICATION
    );
  }

  private generateVerificationHash(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  async verify(
    verifyDto: VerifyDto,
    request: Request,
  ): Promise<LoginResponseInterface> {
    const { verificationHash, code } = verifyDto;

    const storedData = await this.cacheService.get<{
      code: string;
      email: string;
      userId: string;
    }>(`verification_hash:${verificationHash}`);

    if (!storedData) {
      throw new BadRequestException('errors.hash_expired');
    }

    if (storedData.code !== code) {
      throw new UnauthorizedException('errors.invalid_code');
    }

    const user = await this.userRepository.getUserByFilter({
      id: storedData.userId,
    });

    if (!user) {
      throw new UnauthorizedException('errors.user_not_found');
    }

    await this.cacheService.delete(`verification_hash:${verificationHash}`);

    const { access_token, refresh_token } = await this.generateTokens(user);

    await this.createUserAccess(user, request, '/auth/verify');

    return {
      access_token,
      refresh_token,
      user,
    };
  }

  private generateLoginCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private async verifyPassword(user: User, loginData: LoginDto): Promise<void> {
    if (!user.password || !loginData.password)
      throw new UnauthorizedException('errors.unauthorized');

    const isPasswordValid = await comparePassword(
      loginData.password,
      user.password,
    );
    if (!isPasswordValid)
      throw new UnauthorizedException('errors.unauthorized');
  }

  private async generateTokens(user: User): Promise<{
    access_token: string;
    refresh_token: string;
  }> {
    const access_token = this.jwtService.sign(user, {
      expiresIn: ACCESS_TOKEN_TTL,
    });
    const refresh_token = this.jwtService.sign({
      id: user.id,
    });
    await this.storeRefreshToken(user, refresh_token);
    return { access_token, refresh_token };
  }
  private async storeRefreshToken(
    user: User,
    refresh_token: string,
  ): Promise<void> {
    await this.cacheService.set(`refresh_token:${user.id}`, refresh_token, {
      ttl: REFRESH_TOKEN_TTL,
    });
  }

  async refreshToken(refresh_token: string): Promise<LoginResponseInterface> {
    try {
      const payload = this.jwtService.verify<{ id: string }>(refresh_token);
      const userId = payload.id;

      if (!userId) {
        throw new UnauthorizedException('errors.invalid_refresh_token');
      }

      const refreshToken = await this.cacheService.get<string>(
        `refresh_token:${userId}`,
      );
      if (refreshToken !== refresh_token) {
        throw new UnauthorizedException('errors.invalid_refresh_token');
      }

      const user = await this.userRepository.getUserByFilter({
        id: userId,
      });
      if (!user) {
        this.logger.error(
          `Usuário não encontrado, erro não mapeado, VERIFICAR: ${userId}`,
        );
        throw new UnauthorizedException('errors.user_not_found');
      }

      const {
        access_token: new_access_token,
        refresh_token: new_refresh_token,
      } = await this.generateTokens(user);

      return {
        user,
        access_token: new_access_token,
        refresh_token: new_refresh_token,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      this.logger.error(
        'Erro ao atualizar token de acesso, VERIFICAR: ',
        error,
      );
      throw new UnauthorizedException('errors.invalid_refresh_token');
    }
  }

  async requestPasswordReset(
    requestPasswordResetDto: RequestPasswordResetDto,
    request: Request,
  ): Promise<CodeSentResponseInterface> {
    const { email } = requestPasswordResetDto;

    const user = await this.userRepository.getUserByFilter({
      email,
    });

    if (!user) {
      return {
        message:
          'Se o email estiver cadastrado, você receberá um código de confirmação',
        email,
        verificationHash: '',
      };
    }

    const code = this.generateLoginCode();
    const verificationHash = this.generateVerificationHash();

    await this.cacheService.set(
      `password_reset_hash:${verificationHash}`,
      {
        code,
        email: user.email,
        userId: user.id,
      },
      {
        ttl: LOGIN_CODE_TTL,
      },
    );

    if (request)
      await this.createUserAccess(user, request, '/auth/forgot-password');

    await this.emailService.queueEmail({
      template: new ResetPasswordEmailTemplate(),
      to: user.email,
      templateData: {
        name: user.name,
        code,
        appName: this.configService.getEmailFromName(),
      },
      request,
    });

    return {
      message: 'messages.code_sent',
      email: user.email,
      verificationHash,
    };
  }

  async resetPassword(
    resetPasswordDto: ResetPasswordDto,
    request: Request,
  ): Promise<{ message: string }> {
    const { verificationHash, code, newPassword } = resetPasswordDto;

    const storedData = await this.cacheService.get<{
      code: string;
      email: string;
      userId: string;
    }>(`password_reset_hash:${verificationHash}`);

    if (!storedData) {
      throw new BadRequestException('errors.hash_expired');
    }

    if (storedData.code !== code) {
      throw new UnauthorizedException('errors.invalid_code');
    }

    const user = await this.userRepository.getUserByFilter({
      id: storedData.userId,
    });

    if (!user) {
      throw new NotFoundException('errors.user_not_found');
    }

    const hashedPassword = await hashPassword(newPassword);
    await this.userRepository.updateUser(user.id, {
      password: hashedPassword,
    });

    await this.cacheService.delete(`password_reset_hash:${verificationHash}`);

    if (request)
      await this.createUserAccess(user, request, '/auth/reset-password');

    return {
      message: 'messages.password_reset',
    };
  }
}
