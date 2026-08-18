import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsEmail, IsUrl, IsEnum } from 'class-validator';
import { Privacy } from '../../../generated/prisma/enums';
import { Transform } from 'class-transformer';

export class UpdateUserDto {
  @ApiPropertyOptional({
    description: 'Имя пользователя',
    example: 'ivan_gamer',
  })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiPropertyOptional({
    description: 'Email',
    example: 'ivan@mail.com',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Файл изображения (JPG, PNG)',
  })
  @IsOptional()
  @IsUrl()
  avatar?: string;

  @ApiPropertyOptional({
    description: 'О себе',
    example: 'Люблю игры и котиков',
  })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiPropertyOptional({
    description: 'Приватность профиля',
    enum: Privacy,
    example: 'PUBLIC',
  })
  @IsOptional()
  @IsEnum(Privacy)
  profilePrivacy?: Privacy;

  @ApiPropertyOptional({
    description: 'Включить уведомления',
    example: true,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === 'false')
  notificationsEnabled?: boolean;

  @ApiPropertyOptional({
    description: 'Discord Webhook URL',
    example: 'https://discord.com/api/webhooks/...',
  })
  @IsOptional()
  @IsUrl()
  discordWebhookUrl?: string;
}
