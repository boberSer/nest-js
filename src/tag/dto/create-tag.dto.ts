import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class CreateTagDto {
  @ApiProperty({
    description:
      'Название тега (только буквы, цифры, подчёркивания, дефисы и # в начале)',
    example: '#магия',
  })
  @IsNotEmpty({ message: 'Название тега обязательно' })
  @IsString({ message: 'Название должно быть строкой' })
  @Matches(/^#?[a-zA-Zа-яА-Я0-9_\-\s]+$/, {
    message:
      'Тег может содержать только буквы, цифры, подчёркивания, дефисы и пробелы. # — опционально в начале.',
  })
  name: string;
}
