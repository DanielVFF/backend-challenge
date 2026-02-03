import { Controller, Get, Query, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { GoogleService } from './google.service';
import {
  ApiGoogleLoginResponse,
  ApiGoogleCallbackResponse,
} from './google.swagger';

@Controller('/auth/google')
export class GoogleController {
  constructor(private readonly googleService: GoogleService) {}

  @ApiGoogleLoginResponse()
  @Get('/login')
  login(@Res() res: Response) {
    this.googleService.redirectToGoogle(res);
  }

  @ApiGoogleCallbackResponse()
  @Get('/callback')
  async callback(
    @Query('code') code: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    return this.googleService.callback(code, req, res);
  }
}
