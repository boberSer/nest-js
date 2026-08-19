import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class SendMessageDto {
  @ApiProperty({ example: 5, description: 'ID пользователя-получателя' })
  @IsInt({ message: 'receiverId должен быть целым числом' })
  @IsNotEmpty({ message: 'receiverId обязателен для заполнения' })
  receiverId: number;

  @ApiProperty({ example: 'Привет, как дела?', description: 'Текст сообщения' })
  @IsString({ message: 'content должен быть строкой' })
  @IsNotEmpty({ message: 'Текст сообщения не может быть пустым' })
  @MaxLength(2000, { message: 'Сообщение не может быть длиннее 2000 символов' }) // Лимит самого Дискорда, кстати
  content: string;
}
