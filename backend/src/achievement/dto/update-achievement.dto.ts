import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  IsEnum,
  Min,
  Max,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { CollectType, Rarity } from '../../../generated/prisma/enums';

export class UpdateAchievementDto {
  @ApiPropertyOptional({
    description: 'Название ачивки',
    example: 'Победитель дракона (обновлено)',
  })
  @IsOptional()
  @IsString({ message: 'Название должно быть строкой' })
  title?: string;

  @ApiPropertyOptional({
    description: 'Описание ачивки',
    example: 'Победить Эндер-Дракона в Minecraft в одиночку',
  })
  @IsOptional()
  @IsString({ message: 'Описание должно быть строкой' })
  description?: string;

  @ApiPropertyOptional({
    description: 'Иконка ачивки',
    example: '🐉',
  })
  @IsOptional()
  @IsString({ message: 'Иконка должна быть строкой' })
  icon?: string;

  @ApiPropertyOptional({
    description: 'Текущий прогресс',
    example: 50,
    minimum: 0,
  })
  @IsOptional()
  @IsInt({ message: 'progress должен быть числом' })
  @Min(0, { message: 'progress не может быть отрицательным' })
  @Transform(({ value }) => +value)
  progress: number;

  @ApiPropertyOptional({
    description: 'Максимальное значение прогресса',
    example: 100,
    minimum: 1,
    maximum: 10000,
  })
  @IsOptional()
  @IsInt({ message: 'progressMax должен быть числом' })
  @Min(1, { message: 'progressMax должен быть больше 0' })
  @Max(10000, { message: 'progressMax не может быть больше 10000' })
  @Transform(({ value }) => +value)
  progressMax: number;

  @ApiPropertyOptional({
    description: 'Разблокирована ли ачивка',
    example: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'isUnlocked должен быть булевым значением' })
  @Transform(({ value }) => value === 'true' || value === 'false')
  isUnlocked?: boolean;

  @ApiPropertyOptional({
    description: 'Редкость ачивки',
    enum: Rarity,
    example: Rarity.EPIC,
  })
  @IsOptional()
  @IsEnum(Rarity, { message: 'Некорректное значение rarity' })
  rarity?: Rarity;
}
