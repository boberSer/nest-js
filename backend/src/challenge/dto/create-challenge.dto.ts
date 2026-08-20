import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateChallengeDto {
  @ApiProperty({
    description: 'ID игры',
    example: '1',
  })
  @IsNotEmpty()
  @IsInt()
  gameId: number;

  @ApiProperty({
    description: 'Название челленджа',
    example: 'Собрать 50 алмазов',
  })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiPropertyOptional({
    description: 'Описание',
    example: 'В Minecraft на SkyBlock',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Целевое значение', example: 50, minimum: 1 })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Transform(({ value }) => +value)
  targetValue: number;

  @ApiPropertyOptional({
    description: 'Дедлайн',
    example: '2026-12-31T23:59:59.000Z',
  })
  @IsOptional()
  deadline?: Date;
}
