import { IsInt, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class StartSessionDto {
  @IsInt()
  @ApiProperty({
    example: 1,
  })
  gameId: number;

  @IsOptional()
  @IsInt()
  @ApiProperty({
    example: 1,
  })
  subcategoryId?: number;
}

export class EndSessionDto {
  @IsInt()
  @ApiProperty({
    example: 1,
  })
  gameId: number;

  @IsOptional()
  @IsInt()
  @ApiProperty({
    example: 1,
  })
  subcategoryId?: number;
}
