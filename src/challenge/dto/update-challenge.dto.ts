// challenge/dto/update-challenge.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsOptional,
  IsString,
  IsBoolean,
  Min,
  Max,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateChallengeDto {
  @ApiPropertyOptional({
    description: 'Название челленджа',
    example: 'Собрать 100 алмазов за 2 часа',
  })
  @IsOptional()
  @IsString({ message: 'Название должно быть строкой' })
  title?: string;

  @ApiPropertyOptional({
    description: 'Описание челленджа',
    example: 'Обновлённое описание',
  })
  @IsOptional()
  @IsString({ message: 'Описание должно быть строкой' })
  description?: string;

  @ApiPropertyOptional({
    description: 'Целевое значение',
    example: 100,
    minimum: 1,
  })
  @IsOptional()
  @IsInt({ message: 'targetValue должен быть числом' })
  @Min(1, { message: 'targetValue должен быть больше 0' })
  @Transform(({ value }) => parseInt(value, 10))
  targetValue?: number;

  @ApiPropertyOptional({
    description: 'Текущий прогресс',
    example: 50,
    minimum: 0,
  })
  @IsOptional()
  @IsInt({ message: 'currentValue должен быть числом' })
  @Min(0, { message: 'currentValue не может быть отрицательным' })
  @Transform(({ value }) => parseInt(value, 10))
  currentValue?: number;

  @ApiPropertyOptional({
    description: 'Дедлайн (дата окончания)',
    example: '2026-12-31T23:59:59.000Z',
  })
  @IsOptional()
  deadline?: Date;

}
