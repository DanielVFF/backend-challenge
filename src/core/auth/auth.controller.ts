import { Body, Controller, HttpCode, Post, Req } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { Request } from 'express';
import { AuthService } from './auth.service';
import {
  LoginResponseInterface,
  CodeSentResponseInterface,
} from './interfaces/auth.interface';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { VerifyDto } from './dto/verify.dto';
import { RequestPasswordResetDto } from './dto/request-password-reset.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import {
  ApiLoginResponse,
  ApiVerifyResponse,
  ApiRefreshTokenResponse,
  ApiForgotPasswordResponse,
  ApiResetPasswordResponse,
} from './auth.swagger';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/login')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiLoginResponse()
  @HttpCode(200)
  async login(
    @Body() data: LoginDto,
    @Req() request: Request,
  ): Promise<LoginResponseInterface | CodeSentResponseInterface> {
    return this.authService.authenticateUser(data, request);
  }

  @Post('/verify')
  @ApiVerifyResponse()
  @HttpCode(200)
  async verify(
    @Body() data: VerifyDto,
    @Req() request: Request,
  ): Promise<LoginResponseInterface> {
    return this.authService.verify(data, request);
  }

  @Post('/refresh')
  @ApiRefreshTokenResponse()
  @HttpCode(200)
  async refreshToken(
    @Body() data: RefreshTokenDto,
  ): Promise<LoginResponseInterface> {
    return this.authService.refreshToken(data.refresh_token);
  }

  @Post('/forgot-password')
  @ApiForgotPasswordResponse()
  @HttpCode(200)
  async requestPasswordReset(
    @Body() data: RequestPasswordResetDto,
    @Req() request: Request,
  ): Promise<CodeSentResponseInterface> {
    return this.authService.requestPasswordReset(data, request);
  }

  @Post('/reset-password')
  @ApiResetPasswordResponse()
  @HttpCode(200)
  async resetPassword(
    @Body() data: ResetPasswordDto,
    @Req() request: Request,
  ): Promise<{ message: string }> {
    return this.authService.resetPassword(data, request);
  }
}
