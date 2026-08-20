import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StatisticService {
  constructor(private readonly prismaService: PrismaService) {}

  async updateUserStatistics(userId: number) {
    const [totalTime, gameCount, achievementsCount, momentsCount] =
      await Promise.all([
        this.prismaService.gameSession.aggregate({
          where: { userId, endedAt: { not: null } },
          _sum: { durationMinutes: true },
        }),
        this.prismaService.userGame.count({ where: { userId } }),
        this.prismaService.achievement.count({
          where: { userId: userId, isUnlocked: true },
        }),
        this.prismaService.moment.count({ where: { userId } }),
      ]);

    await this.prismaService.statistic.upsert({
      where: { userId },
      update: {
        totalHours: Math.floor((totalTime._sum.durationMinutes || 0) / 60),
        gameCount,
        achievementsCount,
        momentsCount,
      },
      create: {
        userId,
        totalHours: Math.floor((totalTime._sum.durationMinutes || 0) / 60),
        gameCount,
        achievementsCount,
        momentsCount,
      },
    });
  }

  async getAllTime(userId: number) {
    const totalTime = await this.prismaService.gameSession.aggregate({
      where: { userId, endedAt: { not: null } },
      _sum: { durationMinutes: true },
    });

    const minutes = totalTime._sum.durationMinutes || 0;
    const hours = Math.floor(minutes / 60);

    return { totalMinutes: minutes, totalHours: hours };
  }

  async getGameTime(userId: number, gameId: number) {
    const game = await this.prismaService.game.findUnique({
      where: { id: gameId },
    });

    if (!game) throw new NotFoundException('Игра не найдена');

    const gameTime = await this.prismaService.gameSession.aggregate({
      where: { userId, gameId, endedAt: { not: null } },
      _sum: { durationMinutes: true },
    });

    const minutes = gameTime._sum.durationMinutes || 0;
    const hours = Math.floor(minutes / 60);

    return { totalMinutes: minutes, totalHours: hours };
  }

  async getUserAchievements(userId: number) {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
    });

    if (!user) throw new NotFoundException('Пользователь не найден');

    const achievementsCount = await this.prismaService.achievement.count({
      where: { userId: userId, isUnlocked: true },
    });

    return { achievementsCount: achievementsCount };
  }

  async getUserGames(userId: number) {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
    });

    if (!user) throw new NotFoundException('Пользователь не найден');

    const gamesCount = await this.prismaService.userGame.count({
      where: { userId },
    });

    return { gamesCount: gamesCount };
  }

  async getUserMoments(userId: number) {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
    });

    if (!user) throw new NotFoundException('Пользователь не найден');

    const momentsCount = await this.prismaService.moment.count({
      where: { userId },
    });

    return { momentsCount: momentsCount };
  }

  async getUserFriendsCount(userId: number) {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
    });

    if (!user) throw new NotFoundException('Пользователь не найден');

    const friendsCount = await this.prismaService.friend.count({
      where: { userId },
    });

    return { friendsCount: friendsCount };
  }
}
