import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CollectType, Rarity } from '../../generated/prisma/enums';
import { CreateAchievementDto } from './dto/achievement.dto';
import { UploadService } from '../upload/upload.service';
import { UpdateAchievementDto } from './dto/update-achievement.dto';

@Injectable()
export class AchievementService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly uploadService: UploadService,
  ) {}

  async checkTimeBasedAchievements(
    userId: number,
    gameId: number,
    subcategoryId?: number,
  ) {
    const where: any = {
      userId,
      gameId,
      endedAt: { not: null },
    };

    if (subcategoryId) {
      where.subcategoryId = subcategoryId;
    }

    const totalMinutes = await this.prismaService.gameSession.aggregate({
      where,
      _sum: {
        durationMinutes: true,
      },
    });

    const totalHours = Math.floor(
      (totalMinutes._sum.durationMinutes || 0) / 60,
    );

    console.log(`📊 Проверка ачивок:`);
    console.log(`   userId: ${userId}`);
    console.log(`   gameId: ${gameId}`);
    console.log(`   subcategoryId: ${subcategoryId || 'null'}`);
    console.log(`   totalHours: ${totalHours}`);

    const thresholds = [1, 10, 50, 100, 500];

    for (const threshold of thresholds) {
      if (totalHours >= threshold) {
        console.log(`🏆 Выдаём ачивку за ${threshold} часов`);
        await this.unlockAchievement(
          userId,
          gameId,
          subcategoryId ?? null,
          `time_${threshold}h`,
        );
      }
    }
  }

  async unlockAchievement(
    userId: number,
    gameId: number,
    subcategoryId: number | null,
    typeKey: string,
  ) {
    const templates: Record<
      string,
      {
        title: string;
        description: string;
        rarity: Rarity;
        progressMax: number;
        type: CollectType;
      }
    > = {
      time_1h: {
        title: 'Новичок',
        description: 'Провести 1 час в игре',
        rarity: 'COMMON',
        progressMax: 1,
        type: CollectType.TIME_BASED,
      },
      time_10h: {
        title: 'Игрок',
        description: 'Провести 10 часов в игре',
        rarity: 'COMMON',
        progressMax: 10,
        type: CollectType.TIME_BASED,
      },
      time_50h: {
        title: 'Опытный',
        description: 'Провести 50 часов в игре',
        rarity: 'RARE',
        progressMax: 50,
        type: CollectType.TIME_BASED,
      },
      time_100h: {
        title: 'Мастер',
        description: 'Провести 100 часов в игре',
        rarity: 'EPIC',
        progressMax: 100,
        type: CollectType.TIME_BASED,
      },
      time_500h: {
        title: 'Легенда',
        description: 'Провести 500 часов в игре',
        rarity: 'LEGENDARY',
        progressMax: 500,
        type: CollectType.TIME_BASED,
      },
      time_1000h: {
        title: 'Бессмертный',
        description: 'Провести 1000 часов в игре',
        rarity: 'LEGENDARY',
        progressMax: 1000,
        type: CollectType.TIME_BASED,
      },
      // Коллекционирование
      collection_complete: {
        title: 'Исследователь',
        description: 'Посетить все подкатегории игры',
        rarity: 'EPIC',
        progressMax: 100,
        type: CollectType.COLLECTION_BASED,
      },
    };

    const template = templates[typeKey];
    if (!template) {
      return null;
    }

    const existing = await this.prismaService.achievement.findFirst({
      where: {
        userId,
        gameId,
        subcategoryId: subcategoryId,
        title: template.title,
      },
    });

    if (existing) {
      if (!existing.isUnlocked) {
        return this.prismaService.achievement.update({
          where: { id: existing.id },
          data: {
            isUnlocked: true,
            progress: template.progressMax,
          },
        });
      }
      return existing;
    }

    return this.prismaService.achievement.create({
      data: {
        userId,
        gameId,
        subcategoryId: subcategoryId,
        title: template.title,
        description: subcategoryId
          ? `${template.description} (в подкатегории)`
          : template.description,
        rarity: template.rarity,
        type: template.type,
        isUnlocked: true,
        progress: template.progressMax,
        progressMax: template.progressMax,
        icon: this.getIconForAchievement(typeKey),
      },
    });
  }

  private getIconForAchievement(type: string): string {
    const icons: Record<string, string> = {
      time_1h: '🕐',
      time_10h: '⏰',
      time_50h: '⏳',
      time_100h: '⭐',
      time_500h: '👑',
      time_1000h: '💎',
      collection_complete: '🗺️',
    };
    return icons[type] || '🏆';
  }

  async checkCollectionAchievement(userId: number, gameId: number) {
    const allSubcategories = await this.prismaService.gameSession.findMany({
      where: { gameId },
      select: { id: true },
    });

    if (allSubcategories.length === 0) return;

    const visitedSubcategories = await this.prismaService.gameSession.findMany({
      where: {
        userId,
        gameId,
        subcategoryId: { not: null },
        endedAt: { not: null },
      },
      distinct: 'subcategoryId',
      select: { subcategoryId: true },
    });

    const visitedIds = new Set(
      visitedSubcategories.map((subcategory) => subcategory.subcategoryId),
    );

    const allVisited = allSubcategories.every((s) => visitedIds.has(s.id));

    if (allVisited) {
      await this.unlockAchievement(userId, gameId, null, 'collection_complete');
    }
  }

  async getAchievements(userId: number) {
    return this.prismaService.achievement.findMany({
      where: { userId },
    });
  }

  async getGameAchievement(userId: number, gameId: number) {
    const game = await this.prismaService.game.findUnique({
      where: { id: +gameId },
    });

    if (!game) throw new NotFoundException('Игра не найдена');

    const achievements = await this.prismaService.achievement.findMany({
      where: { userId, gameId: +gameId },
      include: {
        subcategory: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
      },
    });

    return {
      gameId: gameId,
      gameName: game.name,
      achievements,
    };
  }

  async getSubcategoryAchievement(userId: number, subcategoryId: number) {
    const subcategory = await this.prismaService.subcategory.findUnique({
      where: { id: +subcategoryId },
    });

    if (!subcategory) throw new NotFoundException('Игра не найдена');

    const achievements = await this.prismaService.achievement.findMany({
      where: { userId, gameId: +subcategoryId },
      include: {
        subcategory: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
      },
    });

    return {
      gameId: subcategoryId,
      gameName: subcategory.name,
      achievements,
    };
  }

  async getAchievement(userId: number, achievementId: number) {
    const achievement = await this.prismaService.achievement.findUnique({
      where: { id: +achievementId },
    });
    if (!achievement) throw new NotFoundException('Ачивка не найдена');

    if (achievement.userId !== userId)
      throw new ForbiddenException('Ачивка не принадлежит вам');

    return achievement;
  }

  async create(
    userId: number,
    dto: CreateAchievementDto,
    file?: Express.Multer.File,
  ) {
    const {
      subcategoryId,
      gameId,
      title,
      description,
      progressMax,
      rarity,
      type,
    } = dto;

    const game = await this.prismaService.game.findUnique({
      where: { id: +gameId },
    });

    if (!game) throw new NotFoundException('Игра не найдена');

    let subId: number | null = null;

    if (subcategoryId) {
      const subcategory = await this.prismaService.subcategory.findFirst({
        where: { id: +subcategoryId, gameId: +gameId },
      });

      if (!subcategory)
        throw new NotFoundException('Подкатегория этой игры не найдена');

      subId = subcategoryId;
    }

    let icon: string | null = null;

    if (file) {
      const uploadResult = this.uploadService.upload(file, 'achievements');
      icon = uploadResult.path;
    }

    return this.prismaService.achievement.create({
      data: {
        userId,
        gameId: +gameId,
        subcategoryId: subId,
        title,
        description,
        progressMax: +progressMax,
        rarity,
        icon,
        type,
      },
    });
  }

  async update(
    userId: number,
    achievementId: number,
    dto: UpdateAchievementDto,
    file?: Express.Multer.File,
  ) {
    const achievement = await this.prismaService.achievement.findFirst({
      where: { id: +achievementId, userId },
    });

    if (!achievement) throw new NotFoundException('Ачивка не найдена');

    if (achievement.type !== 'ACTION_BASED')
      throw new ConflictException('Нельзя изменить автоматическую ачивку');

    let icon: string | null = null;
    if (file) {
      const uploadResult = this.uploadService.upload(file, 'achievements');
      icon = uploadResult.path;
    }

    return this.prismaService.achievement.update({
      where: {
        id: +achievementId,
      },
      data: {
        ...dto,
        icon,
      },
    });
  }

  async delete(userId: number, achievementId: number) {
    const achievement = await this.prismaService.achievement.findUnique({
      where: { id: +achievementId },
    });

    if (!achievement) throw new NotFoundException('Ачивка не найдена');
    if (achievement.userId !== userId)
      throw new ForbiddenException(
        'Нельзя удалить ачивку, которую создали не вы',
      );
    if (achievement.type !== 'ACTION_BASED')
      throw new ConflictException('Нельзя удалить автоматическую ачивку');

    return this.prismaService.achievement.delete({
      where: { id: +achievementId },
    });
  }
}
