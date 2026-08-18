import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateProgressDto {
  @ApiProperty({
    description: 'Выполненное значение челленджа',
    example: 50,
    minimum: 1,
  })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Transform(({ value }) => +value)
  currentValue: number;
}
