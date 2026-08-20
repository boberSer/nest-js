import { IsArray, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class FavoriteGame {
  @IsInt()
  @ApiProperty({
    example: 1,
  })
  gameId: number;
}

export class FavoriteSubcategory {
  @IsInt()
  @ApiProperty({
    example: 1,
  })
  subcategoryId: number;
}

export class ReorderFavoritesDto {
  @IsArray()
  @ApiProperty({
    example: [{ id: 1, order: 1 }],
  })
  updates: {
    id: number;
    order: number;
  }[];
}
