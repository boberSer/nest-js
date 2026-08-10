import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsOptional,
  IsString,
  Min,
  Max,
  IsNotEmpty,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateReviewDto {
  @ApiProperty({ description: 'ID игры', example: 1 })
  @IsNotEmpty()
  @IsInt()
  @Transform(({ value }) => +value)
  gameId: number;

  @ApiPropertyOptional({
    description: 'ID подкатегории (опционально)',
    example: 5,
  })
  @IsOptional()
  @IsInt()
  @Transform(({ value }) => +value)
  subcategoryId?: number;

  @ApiProperty({
    description: 'Оценка (1-5)',
    example: 4,
    minimum: 1,
    maximum: 5,
  })
  @IsInt()
  @Min(1, { message: 'Оценка должна быть от 1 до 5' })
  @Max(5, { message: 'Оценка должна быть от 1 до 5' })
  @Transform(({ value }) => +value)
  rating: number;

  @ApiPropertyOptional({
    description: 'Текст отзыва',
    example: 'Отличная игра!',
  })
  @IsOptional()
  @IsString()
  comment?: string;
}
