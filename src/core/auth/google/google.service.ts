import { BadRequestException, Injectable } from '@nestjs/common';
import type { Request, Response } from 'express';
import { EnvironmentConfigService } from 'src/core/environment-config/environment-config.service';
import axios from 'axios';
import { userDtoFactory } from 'src/modules/user/dto/user.dto';
import { UserService } from 'src/modules/user/user.service';
import { LoggerService } from 'src/core/logger/logger.service';
import { AuthService } from '../auth.service';
import { loginDtoFactory } from '../dto/login.dto';
import { GoogleUserResponse } from './interfaces/google-user.interface';
import { ProviderEnum } from 'src/modules/user/dto/provider.dto/user-provider.dto';

@Injectable()
export class GoogleService {
  constructor(
    private readonly configService: EnvironmentConfigService,
    private readonly userService: UserService,
    private readonly authService: AuthService,
    private readonly logger: LoggerService,
  ) {}

  redirectToGoogle(res: Response): void {
    const params = new URLSearchParams({
      client_id: this.configService.getGoogleClientId(),
      redirect_uri: this.configService.getGoogleRedirectUri(),
      response_type: 'code',
      scope: 'openid email profile',
      access_type: 'offline',
      prompt: 'consent',
    });
    const url = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    res.redirect(url);
  }

  async callback(code: string, req: Request, res: Response) {
    const accessToken = await this.getAccessTokenFromGoogle(code);
    const userInfo = await this.getUserInfoFromGoogle(accessToken);
    if (!userInfo) throw new BadRequestException('errors.google_user_error');

    if (!userInfo.verified_email) {
      throw new BadRequestException('errors.google_email_not_verified');
    }

    const userData = userDtoFactory({
      name: userInfo.name,
      email: userInfo.email,
    });

    const user = await this.userService.getOrCreateUser(userData);
    await this.userService.upsertProvider(
      user.id,
      ProviderEnum.GOOGLE,
      userInfo.id,
    );

    const authResult = await this.authService.authenticateUser(
      loginDtoFactory(user),
      req,
      true,
    );

    if ('access_token' in authResult && 'refresh_token' in authResult) {
      const frontendUrl = this.configService.getFrontendUrl();
      const hashParams = new URLSearchParams();
      hashParams.set('access_token', authResult.access_token);
      hashParams.set('refresh_token', authResult.refresh_token);
      if (authResult.user) {
        hashParams.set('user', JSON.stringify(authResult.user));
      }
      const redirectUrl = `${frontendUrl}/#/auth/callback?${hashParams.toString()}`;
      res.redirect(redirectUrl);
      return;
    }

    return authResult;
  }

  private async getAccessTokenFromGoogle(code: string): Promise<string> {
    try {
      const params = new URLSearchParams({
        client_id: this.configService.getGoogleClientId(),
        client_secret: this.configService.getGoogleClientSecret(),
        code,
        grant_type: 'authorization_code',
        redirect_uri: this.configService.getGoogleRedirectUri(),
      });
      const tokenResponse = await axios.post<{ access_token: string }>(
        'https://oauth2.googleapis.com/token',
        params.toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );
      return tokenResponse.data.access_token;
    } catch (error) {
      this.logger.error(
        'Erro ao obter o token de acesso do Google',
        JSON.stringify(error),
      );
      throw new BadRequestException('errors.google_token_error');
    }
  }

  private async getUserInfoFromGoogle(
    accessToken: string,
  ): Promise<GoogleUserResponse> {
    try {
      const userResponse = await axios.get<GoogleUserResponse>(
        'https://www.googleapis.com/oauth2/v2/userinfo',
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      );

      return userResponse.data;
    } catch (error) {
      this.logger.error(
        'Erro ao obter o usuário do Google',
        JSON.stringify(error),
      );
      throw new BadRequestException('errors.google_user_error');
    }
  }
}
