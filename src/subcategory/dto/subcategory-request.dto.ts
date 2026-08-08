import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SubcategoryRequest {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: 'name',
  })
  name: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: 'type',
  })
  type: string;

  @IsNotEmpty()
  @IsString()
  @IsOptional()
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Файл обложки игры (JPEG/PNG)',
  })
  image?: string;

  @IsNotEmpty()
  @IsString()
  @IsOptional()
  @ApiProperty({
    example: 'description',
  })
  description?: string;
}
