import { Injectable } from '@nestjs/common';
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
}
