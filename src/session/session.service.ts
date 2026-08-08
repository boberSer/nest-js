import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AchievementService } from '../achievement/achievement.service';
import { StatisticService } from '../statistic/statistic.service';

@Injectable()
export class SessionService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly achievementService: AchievementService,
    private readonly statisticService: StatisticService,
  ) {}

  async start(userId: number, gameId: number, subcategoryId?: number) {
    const game = await this.prismaService.game.findUnique({
      where: { id: gameId },
    });

    if (!game) throw new NotFoundException('Игра не найдена');

    if (subcategoryId) {
      const subcategory = await this.prismaService.subcategory.findFirst({
        where: { id: subcategoryId, gameId },
      });

      if (!subcategory)
        throw new NotFoundException('Подкатегория в этой игре не найдена');
    }

    const active = await this.prismaService.gameSession.findFirst({
      where: {
        userId,
        gameId,
        endedAt: null,
      },
    });

    if (active)
      throw new ConflictException(
        'У вас уже есть активная сессия для этой игры',
      );

    return this.prismaService.gameSession.create({
      data: {
        userId,
        gameId,
        subcategoryId,
        startedAt: new Date(),
      },
    });
  }

  async stop(userId: number, gameId: number, subcategoryId?: number) {
    const where: any = {
      userId,
      gameId,
      endedAt: null,
    };

    if (subcategoryId !== undefined) {
      where.subcategoryId = subcategoryId;
    }

    const session = await this.prismaService.gameSession.findFirst({
      where,
    });

    if (!session) {
      throw new NotFoundException(
        subcategoryId
          ? `Нет активной сессии для этой игры и подкатегории`
          : `Нет активной сессии для этой игры`,
      );
    }

    const endedAt = new Date();
    const durationMinutes = Math.floor(
      (endedAt.getTime() - session.startedAt.getTime()) / 1000,
    );

    const updated = await this.prismaService.gameSession.update({
      where: { id: session.id },
      data: {
        endedAt,
        durationMinutes,
      },
    });

    await this.achievementService.checkTimeBasedAchievements(
      userId,
      gameId,
      subcategoryId,
    );

    if (subcategoryId) {
      await this.achievementService.checkCollectionAchievement(userId, gameId);
    }

    await this.statisticService.updateUserStatistics(userId);

    return updated;
  }

  async getUserSessions(userId: number) {
    return this.prismaService.gameSession.findMany({
      where: { userId },
      include: {
        game: {
          select: {
            id: true,
            name: true,
            coverImage: true,
          },
        },
        subcategory: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
      },
      orderBy: { startedAt: 'desc' },
    });
  }

  async getTotalTime(userId: number, gameId: number) {
    const result = await this.prismaService.gameSession.aggregate({
      where: {
        userId,
        gameId,
        endedAt: { not: null },
      },
      _sum: {
        durationMinutes: true,
      },
    });

    return {
      totalMinutes: result._sum.durationMinutes || 0,
      totalHours: Math.floor((result._sum.durationMinutes || 0) / 60),
    };
  }

  async getSubcategoryTime(
    userId: number,
    gameId: number,
    subcategoryId: number,
  ) {
    const result = await this.prismaService.gameSession.aggregate({
      where: {
        userId,
        gameId,
        subcategoryId,
        endedAt: { not: null },
      },
      _sum: {
        durationMinutes: true,
      },
    });

    return {
      totalMinutes: result._sum.durationMinutes || 0,
      totalHours: Math.floor((result._sum.durationMinutes || 0) / 60),
    };
  }
}
