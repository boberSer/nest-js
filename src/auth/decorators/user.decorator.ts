import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';

export const User = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    if (!user) throw new UnauthorizedException('Пользователь не авторизован');

    if (data) return user[data as keyof typeof user];

    return user;
  },
);
