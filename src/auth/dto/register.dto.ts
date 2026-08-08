import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterRequest {
  @ApiProperty({
    description: 'Уникальное имя пользователя',
    example: 'cyber_gamer',
  })
  @IsString()
  @IsNotEmpty({ message: 'Имя пользователя не должно быть пустым' })
  username: string;

  @ApiProperty({
    description: 'Электронная почта пользователя',
    example: 'user@example.com',
  })
  @IsEmail({}, { message: 'Некорректный формат email' })
  @IsNotEmpty({ message: 'Email не должен быть пустым' })
  email: string;

  @ApiProperty({
    description: 'Пароль (минимум 6 символов)',
    example: 'SecurePass123!',
  })
  @IsString()
  @IsNotEmpty({ message: 'Пароль не должен быть пустым' })
  @MinLength(6, { message: 'Пароль должен содержать минимум 6 символов' })
  password: string;
}
