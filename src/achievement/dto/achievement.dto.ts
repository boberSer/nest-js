import { CollectType, Rarity } from '../../../generated/prisma/enums';
import {
  IsInt,
  IsOptional,
  IsString,
  IsEnum,
  IsNotEmpty,
  Min,
  Max,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAchievementDto {
  @ApiProperty({
    description: 'ID игры, к которой относится ачивка',
    example: 1,
    type: Number,
  })
  @IsNotEmpty({ message: 'gameId обязателен' })
  @IsInt({ message: 'gameId должен быть числом' })
  @Transform(({ value }) => parseInt(value, 10))
  gameId: number;

  @ApiPropertyOptional({
    description: 'ID подкатегории (опционально)',
    example: 5,
    type: Number,
    nullable: true,
  })
  @IsOptional()
  @IsInt({ message: 'subcategoryId должен быть числом' })
  @Transform(({ value }) => (value ? parseInt(value, 10) : undefined))
  subcategoryId?: number | null;

  @ApiProperty({
    description: 'Название ачивки',
    example: 'Победитель дракона',
    type: String,
  })
  @IsNotEmpty({ message: 'Название обязательно' })
  @IsString({ message: 'Название должно быть строкой' })
  title: string;

  @ApiProperty({
    description: 'Описание ачивки',
    example: 'Победить Эндер-Дракона в Minecraft',
    type: String,
  })
  @IsNotEmpty({ message: 'Описание обязательно' })
  @IsString({ message: 'Описание должно быть строкой' })
  description: string;

  @ApiPropertyOptional({
    description: 'Иконка ачивки (эмодзи или ссылка)',
    example: '🐉',
    type: String,
    nullable: true,
  })
  @IsOptional()
  @IsString({ message: 'Иконка должна быть строкой' })
  icon?: string;

  @ApiPropertyOptional({
    description: 'Максимальное значение прогресса',
    example: 100,
    type: Number,
    default: 100,
    minimum: 1,
    maximum: 10000,
  })
  @IsOptional()
  @IsInt({ message: 'progressMax должен быть числом' })
  @Min(1, { message: 'progressMax должен быть больше 0' })
  @Max(10000, { message: 'progressMax не может быть больше 10000' })
  @Transform(({ value }) => (value ? parseInt(value, 10) : undefined))
  progressMax: number = 100;

  @ApiPropertyOptional({
    description: 'Редкость ачивки',
    enum: Rarity,
    default: Rarity.COMMON,
    example: Rarity.EPIC,
  })
  @IsOptional()
  @IsEnum(Rarity, { message: 'Некорректное значение rarity' })
  rarity?: Rarity = Rarity.COMMON;

  @ApiPropertyOptional({
    description: 'Тип ачивки',
    enum: CollectType,
    default: CollectType.ACTION_BASED,
    example: CollectType.ACTION_BASED,
  })
  @IsOptional()
  @IsEnum(CollectType, { message: 'Некорректное значение type' })
  type?: CollectType = CollectType.ACTION_BASED;
}
