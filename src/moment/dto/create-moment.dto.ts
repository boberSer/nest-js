import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, IsNotEmpty } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateMomentDto {
  @ApiProperty({
    description: 'ID игры',
    example: 1,
    type: Number,
  })
  @IsNotEmpty({ message: 'gameId обязателен' })
  @IsInt({ message: 'gameId должен быть числом' })
  @Transform(({ value }) => +value)
  gameId: number;

  @ApiPropertyOptional({
    description: 'ID подкатегории (опционально)',
    example: 5,
    type: Number,
  })
  @IsOptional()
  @IsInt({ message: 'subcategoryId должен быть числом' })
  @Transform(({ value }) => +value)
  subcategoryId?: number;

  @IsString()
  @IsOptional()
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Файл изображения (JPG, PNG)',
  })
  imageUrl?: string;

  @ApiPropertyOptional({
    description: 'Подпись к моменту',
    example: 'Моя база в магическом моде!',
    type: String,
  })
  @IsOptional()
  @IsString({ message: 'caption должен быть строкой' })
  caption?: string;
}
