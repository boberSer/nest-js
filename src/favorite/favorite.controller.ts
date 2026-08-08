import { Body, Controller, Delete, Get, Post, UseGuards } from '@nestjs/common';
import { FavoriteService } from './favorite.service';
import { User } from '../auth/decorators/user.decorator';
import {
  FavoriteGame,
  FavoriteSubcategory,
  ReorderFavoritesDto,
} from './dto/favorites.dto';
import { JwtGuard } from '../auth/guards/auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('favorite')
@UseGuards(JwtGuard)
@ApiBearerAuth()
export class FavoriteController {
  constructor(private readonly favoriteService: FavoriteService) {}

  @Post('game')
  async favoriteGame(@Body() dto: FavoriteGame, @User('id') userId: number) {
    return this.favoriteService.favoriteGame(userId, +dto.gameId);
  }

  @Post('subcategory')
  async favoriteSubcategory(
    @Body() dto: FavoriteSubcategory,
    @User('id') userId: number,
  ) {
    return this.favoriteService.favoriteSubcategory(userId, +dto.subcategoryId);
  }

  @Delete('game')
  async deleteGameFavorite(
    @User('id') userId: number,
    @Body() dto: FavoriteGame,
  ) {
    return this.favoriteService.deleteGameFavorite(userId, +dto.gameId);
  }

  @Delete('subcategory')
  async deleteSubcategoryFavorite(
    @User('id') userId: number,
    @Body() dto: FavoriteSubcategory,
  ) {
    return this.favoriteService.deleteSubFavorite(userId, +dto.subcategoryId);
  }

  @Post('reorder')
  async reorder(@User('id') userId: number, @Body() dto: ReorderFavoritesDto) {
    return this.favoriteService.reorderFavorite(userId, dto.updates);
  }

  @Get()
  getFavorites(@User('id') userId: number) {
    return this.favoriteService.getFavorites(userId);
  }
}
