import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ReviewResponseDto {
  @ApiProperty({ description: 'ID отзыва', example: 1 })
  id: number;

  @ApiProperty({ description: 'ID пользователя', example: 1 })
  userId: number;

  @ApiProperty({ description: 'ID игры', example: 1 })
  gameId: number;

  @ApiPropertyOptional({
    description: 'ID подкатегории',
    example: 5,
    nullable: true,
  })
  subcategoryId?: number | null;

  @ApiProperty({ description: 'Оценка (1-5)', example: 4 })
  rating: number;

  @ApiPropertyOptional({
    description: 'Текст отзыва',
    example: 'Отличная игра!',
  })
  comment?: string | null;

  @ApiProperty({
    description: 'Дата создания',
    example: '2026-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiPropertyOptional({ description: 'Информация о пользователе' })
  user?: {
    id: number;
    username: string;
    avatar?: string | null;
  };

  @ApiPropertyOptional({ description: 'Информация о подкатегории' })
  subcategory?: {
    id: number;
    name: string;
    type: string;
  };
}
