import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class GameResponse {
  @IsNotEmpty()
  @IsInt()
  id: number;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description: string | null;

  @IsString()
  @IsOptional()
  coverImage: string | null;

  @IsString()
  @IsOptional()
  genre: string | null;

  @IsString()
  @IsOptional()
  developer: string | null;

  @IsInt()
  @IsOptional()
  releaseYear: number | null;
}
