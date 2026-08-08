import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterRequest } from './dto/register.dto';
import { Response, Request } from 'express';
import * as bcrypt from 'bcrypt';
import { isDev } from '../utils/is-dev.utils';
import { JwtPayload } from './interfaces/jwt.interface';
import { ConflictException } from '@nestjs/common';
import { LoginRequest } from './dto/login.dto';

@Injectable()
class AuthService {
  private readonly JWT_ACCESS_TOKEN_TTL: string;
  private readonly JWT_REFRESH_TOKEN_TTL: string;
  private readonly COOKIE_DOMAIN: string;

  constructor(
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {
    this.JWT_ACCESS_TOKEN_TTL = configService.getOrThrow<string>(
      'JWT_ACCESS_TOKEN_TTL',
    );
    this.JWT_REFRESH_TOKEN_TTL = configService.getOrThrow<string>(
      'JWT_REFRESH_TOKEN_TTL',
    );
    this.COOKIE_DOMAIN = configService.getOrThrow<string>('COOKIE_DOMAIN');
  }

  async register(res: Response, dto: RegisterRequest) {
    const { username, email, password } = dto;

    const existUser = await this.prismaService.user.findUnique({
      where: { email },
    });

    if (existUser)
      throw new ConflictException(
        'Пользователь с таким email уже зарегестрирован',
      );

    const user = await this.prismaService.user.create({
      data: {
        username,
        email,
        password: await bcrypt.hash(password, 10),
      },
    });

    return this.auth(res, user.id);
  }

  async login(res: Response, dto: LoginRequest) {
    const { email, password } = dto;

    const user = await this.prismaService.user.findUnique({
      where: { email },
      select: {
        id: true,
        password: true,
      },
    });

    if (!user) throw new NotFoundException('Пользователь не найден');

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) throw new NotFoundException('Ползователь не найден');

    return this.auth(res, user.id);
  }

  async refresh(req: Request, res: Response) {
    const refreshToken = req.cookies['refreshToken'];

    if (!refreshToken)
      throw new UnauthorizedException('Недействительный refresh-токен');

    const payload: JwtPayload = await this.jwtService.verifyAsync(refreshToken);

    if (payload) {
      const user = await this.prismaService.user.findUnique({
        where: {
          id: payload.id,
        },
        select: {
          id: true,
        },
      });
      if (!user) throw new NotFoundException('Пользователь не найден');

      return this.auth(res, user.id);
    }
  }

  async validate(id: number) {
    const user = await this.prismaService.user.findUnique({
      where: {
        id,
      },
    });
    if (!user) throw new NotFoundException('Пользователь не найден');

    return user;
  }

  private auth(res: Response, id: number) {
    const { accessToken, refreshToken } = this.generateToken(id);

    this.setCookie(
      res,
      refreshToken,
      new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
    );

    return { accessToken };
  }

  private generateToken(id: number) {
    const payload: JwtPayload = { id };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.JWT_ACCESS_TOKEN_TTL as any,
    });

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: this.JWT_REFRESH_TOKEN_TTL as any,
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  logout(res: Response) {
    this.setCookie(res, 'refreshToken', new Date(0));
    return {
      message: 'Успешный выход из аккаунта',
    };
  }

  private setCookie(res: Response, value: string, expires: Date) {
    res.cookie('refreshToken', value, {
      httpOnly: true,
      domain: this.COOKIE_DOMAIN,
      expires,
      secure: !isDev(this.configService),
      sameSite: isDev(this.configService) ? 'none' : 'lax',
    });
  }
}

export default AuthService;
