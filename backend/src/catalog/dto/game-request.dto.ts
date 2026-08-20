import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class GameRequest {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: 'name',
  })
  name: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    example: 'description',
  })
  description?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Файл изображения (JPG, PNG)',
  })
  coverImage?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    example: 'genre',
  })
  genre?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    example: 'Marvel',
  })
  developer?: string;

  @IsInt()
  @IsOptional()
  @ApiProperty({
    example: '2008',
  })
  @Type(() => Number)
  releaseYear?: number;
}
