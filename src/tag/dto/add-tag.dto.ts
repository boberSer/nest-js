import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty } from 'class-validator';
import { Transform } from 'class-transformer';

export class AddTagDto {
  @ApiProperty({
    description: 'ID тега',
    example: 5,
  })
  @IsNotEmpty()
  @IsInt()
  @Transform(({ value }) => parseInt(value, 10))
  tagId: number;
}
