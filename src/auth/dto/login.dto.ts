import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginRequest {
  @IsNotEmpty({ message: 'Почта обязательна к заполнению' })
  @IsEmail({}, { message: 'Некорректный формат email' })
  @ApiProperty({
    description: 'User email',
    example: 'user@example.com',
  })
  email: string;

  @IsNotEmpty({ message: 'Пароль обязателен к заполнению' })
  @IsString({ message: 'Пароль должен быть строкой' })
  @MinLength(6, { message: 'Пароль должен содержать минимум 6 символов' })
  @ApiProperty({
    description: 'User password',
    example: 'SecurePass123!',
    minLength: 6,
  })
  password: string;
}
