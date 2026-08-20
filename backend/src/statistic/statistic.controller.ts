import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { StatisticService } from './statistic.service';
import { User } from '../auth/decorators/user.decorator';
import { JwtGuard } from '../auth/guards/auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';

@UseGuards(JwtGuard)
@ApiBearerAuth()
@Controller('statistics')
export class StatisticController {
  constructor(private readonly statisticService: StatisticService) {}

  @Get()
  async getAllTime(@User('id') id: number) {
    return this.statisticService.getAllTime(id);
  }

  @Get('achievements')
  async getUserAchievements(@User('id') id: number) {
    return this.statisticService.getUserAchievements(+id);
  }

  @Get('games')
  async getUserGames(@User('id') id: number) {
    return this.statisticService.getUserGames(id);
  }

  @Get('moments')
  async getUserMoments(@User('id') id: number) {
    return this.statisticService.getUserMoments(id);
  }

  @Get('friends')
  async getUserFriendsCount(@User('id') id: number) {
    return this.statisticService.getUserFriendsCount(id);
  }

  @Get(':gameId')
  async getGameTime(@User('id') id: number, @Param('gameId') gameId: number) {
    return this.statisticService.getGameTime(id, +gameId);
  }
}
