import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';
import { setupSwagger } from './utils/swagger.util';
import express from 'express';
import path from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  app.use(cookieParser());

  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  app.enableCors({
    origin: config.getOrThrow<string>('ALLOWED_ORIGINS').split(','),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    exposeHeaders: ['Set-Cookie', 'Content-Disposition'],
    allowHeaders: ['Authorization', 'X-Api-Key'],
  });

  setupSwagger(app);

  // await app.listen(process.env.PORT ?? 3000);
  await app.listen(process.env.PORT || 3000, '0.0.0.0');
}
bootstrap();
