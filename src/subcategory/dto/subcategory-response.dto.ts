import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SubcategoryResponse {
  id: number;

  gameId: number;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  type: string;

  @IsNotEmpty()
  @IsString()
  @IsOptional()
  image: string | null;

  @IsNotEmpty()
  @IsString()
  @IsOptional()
  description: string | null;
}
