import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StatisticService } from '../statistic/statistic.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UploadService } from '../upload/upload.service';

@Injectable()
export class UserService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly statisticService: StatisticService,
    private readonly uploadService: UploadService,
  ) {}

  async getProfile(userId: number) {
    await this.statisticService.updateUserStatistics(userId);
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        avatar: true,
        bio: true,
        profilePrivacy: true,
        createdAt: true,

        userGames: {
          select: {
            game: {
              select: {
                id: true,
                name: true,
                coverImage: true,
                genre: true,
                description: true,
                developer: true,
                releaseYear: true,
              },
            },
            isActive: true,
            addedAt: true,
          },
        },

        favorites: {
          select: {
            id: true,
            entityType: true,
            entityId: true,
            order: true,
            createdAt: true,
          },
          orderBy: { order: 'asc' },
        },

        achievements: {
          select: {
            id: true,
            title: true,
            description: true,
            icon: true,
            isUnlocked: true,
            progress: true,
            progressMax: true,
            rarity: true,
            type: true,
            createdAt: true,
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
          orderBy: { createdAt: 'desc' },
          take: 10,
        },

        gameSessions: {
          select: {
            id: true,
            startedAt: true,
            endedAt: true,
            durationMinutes: true,
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
          take: 5,
        },

        moments: true,

        momentLikes: true,

        reviews: true,

        statistics: {
          select: {
            totalHours: true,
            gameCount: true,
            achievementsCount: true,
            momentsCount: true,
          },
        },
      },
    });

    if (!user) throw new NotFoundException('Пользователь не найден');

    return user;
  }

  async updateProfile(
    userId: number,
    dto: UpdateUserDto,
    file?: Express.Multer.File,
  ) {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
    });

    if (!user) throw new NotFoundException('Пользователь не найден');

    let avatar: string | null = null;

    if (file) {
      const uploadResult = this.uploadService.upload(file, 'avatars');
      avatar = uploadResult.path;
    }

    return this.prismaService.user.update({
      where: { id: userId },
      data: {
        ...dto,
        avatar,
      },
    });
  }

  async getUserById(userId: number, currentUserId: number) {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        avatar: true,
        bio: true,
        createdAt: true,
        profilePrivacy: true,

        userGames: {
          select: {
            game: {
              select: {
                id: true,
                name: true,
                coverImage: true,
                genre: true,
                description: true,
              },
            },
          },
        },

        achievements: {
          where: { isUnlocked: true },
          select: {
            id: true,
            title: true,
            description: true,
            icon: true,
            rarity: true,
            game: {
              select: {
                id: true,
                name: true,
                coverImage: true,
              },
            },
          },
          take: 10,
        },

        statistics: {
          select: {
            totalHours: true,
            gameCount: true,
            achievementsCount: true,
            momentsCount: true,
          },
        },
      },
    });

    if (!user) throw new NotFoundException('Пользователь не найден');

    if (user.id === currentUserId) {
      return {
        message: 'Это ваш профиль',
        data: user,
      };
    }

    if (user.profilePrivacy === 'PRIVATE')
      throw new ForbiddenException('Пользователь находится в приватном режиме');

    if (user.profilePrivacy === 'FRIENDS_ONLY') {
      if (!currentUserId)
        throw new ForbiddenException('Профиль доступен только друзьям');

      const isFriend = await this.prismaService.friend.findFirst({
        where: {
          OR: [
            { userId: currentUserId, friendId: userId },
            { userId: userId, friendId: currentUserId },
          ],
        },
      });

      if (!isFriend)
        throw new ForbiddenException('Профиль доступен только друзьям');

      if (isFriend.status === 'BLOCKED')
        throw new ForbiddenException('Пользователь заблокировал вас');

      if (isFriend.status !== 'ACCEPTED')
        throw new ForbiddenException('Профиль доступен только друзьям');
    }

    return user;
  }
}
