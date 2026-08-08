import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FavoriteService {
  constructor(private readonly prismaService: PrismaService) {}

  async favoriteGame(userId: number, gameId: number) {
    const game = await this.prismaService.game.findUnique({
      where: { id: +gameId },
    });

    if (!game) throw new NotFoundException('Игра не найдена');

    return this.prismaService.favorite.upsert({
      where: {
        userId_entityId_entityType: {
          userId,
          entityId: gameId,
          entityType: 'game',
        },
      },
      update: {},
      create: {
        userId,
        entityId: gameId,
        entityType: 'game',
      },
    });
  }

  async favoriteSubcategory(userId: number, subcategoryId: number) {
    const subcategory = await this.prismaService.subcategory.findUnique({
      where: { id: +subcategoryId },
    });

    if (!subcategory) throw new NotFoundException('Игра не найдена');

    return this.prismaService.favorite.upsert({
      where: {
        userId_entityId_entityType: {
          userId,
          entityId: subcategoryId,
          entityType: 'subcategory',
        },
      },
      update: {},
      create: { userId, entityId: subcategoryId, entityType: 'subcategory' },
    });
  }

  async getFavorites(userId: number) {
    const favorites = await this.prismaService.favorite.findMany({
      where: { userId },
      orderBy: { order: 'asc' },
    });

    const gameIds = favorites
      .filter((f) => f.entityType === 'game')
      .map((f) => f.entityId);

    const subcategoryIds = favorites
      .filter((f) => f.entityType === 'subcategory')
      .map((f) => f.entityId);

    const [games, subcategories] = await Promise.all([
      gameIds.length
        ? this.prismaService.game.findMany({ where: { id: { in: gameIds } } })
        : [],
      subcategoryIds.length
        ? this.prismaService.subcategory.findMany({
            where: { id: { in: subcategoryIds } },
            include: { game: true },
          })
        : [],
    ]);

    return favorites.map((fav) => {
      if (fav.entityType === 'game') {
        const gameList = games as any[];
        return {
          ...fav,
          item: gameList.find((g) => g.id === fav.entityId || null),
        };
      } else {
        const subList = subcategories as any[];
        return {
          ...fav,
          item: subList.find((s) => s.id === fav.entityId || null),
        };
      }
    });
  }

  async deleteGameFavorite(userId: number, gameId: number) {
    return this.prismaService.favorite.delete({
      where: {
        userId_entityId_entityType: {
          userId,
          entityId: gameId,
          entityType: 'game',
        },
      },
    });
  }
  async deleteSubFavorite(userId: number, subcategoryId: number) {
    return this.prismaService.favorite.delete({
      where: {
        userId_entityId_entityType: {
          userId,
          entityId: subcategoryId,
          entityType: 'subcategory',
        },
      },
    });
  }

  async reorderFavorite(
    userId: number,
    updates: { id: number; order: number }[],
  ) {
    const favoriteIds = updates.map((update) => update.id);

    const existFavorites = await this.prismaService.favorite.findMany({
      where: {
        id: { in: favoriteIds },
        userId,
      },
      select: { id: true },
    });

    const existIds = new Set(existFavorites.map((favorite) => favorite.id));
    const invalidIds = favoriteIds.filter((id) => !existIds.has(id));

    if (invalidIds.length > 0)
      throw new ForbiddenException(
        `Некоторые фавориты не найдены или не принадлежат вам: ${invalidIds.join(',')}`,
      );

    await this.prismaService.$transaction(
      updates.map(({ id, order }) =>
        this.prismaService.favorite.update({
          where: { id },
          data: { order },
        }),
      ),
    );
  }
}
