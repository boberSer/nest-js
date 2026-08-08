import { Body, Controller, Post, Res } from '@nestjs/common';
import AuthService from './auth.service';
import { RegisterRequest } from './dto/register.dto';
import type { Response } from 'express';
import { LoginRequest } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(
    @Body() dto: RegisterRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    return await this.authService.register(res, dto);
  }

  @Post('login')
  async login(
    @Body() dto: LoginRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    return await this.authService.login(res, dto);
  }
}
