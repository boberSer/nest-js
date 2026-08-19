import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TimelineService } from '../timeline/timeline.service';
import { ActionType, EntityType } from '../../generated/prisma/enums';
import { DiscordService } from '../discord/discord.service';

@Injectable()
export class FriendService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly timelineService: TimelineService,
    private readonly discordService: DiscordService,
  ) {}

  async sendFriendRequest(userId: number, friendId: number) {
    if (userId === friendId)
      throw new ConflictException('Вы не можете отправиль заявку самому себе');

    const existing = await this.prismaService.friend.findFirst({
      where: {
        OR: [
          { userId: userId, friendId: friendId },
          { userId: friendId, friendId: userId },
        ],
      },
    });

    if (existing) {
      if (existing.status === 'ACCEPTED') {
        throw new ConflictException('Вы уже друзья');
      }
      if (existing.status === 'PENDING') {
        throw new ConflictException('Заявка уже отправлена');
      }
      if (existing.status === 'BLOCKED') {
        throw new ConflictException('Пользователь заблокировал вас');
      }
    }

    await this.prismaService.friend.create({
      data: {
        userId,
        friendId,
        status: 'PENDING',
      },
    });

    try {
      // Достаем отправителя (userId), чтобы взять его ник, и получателя (friendId), чтобы взять его вебхук
      const sender = await this.prismaService.user.findUnique({
        where: { id: userId },
      });
      const receiver = await this.prismaService.user.findUnique({
        where: { id: friendId },
      });

      // Если у получателя включены уведомления и привязан вебхук — шлем сообщение
      if (receiver?.notificationsEnabled && receiver?.discordWebhookUrl) {
        await this.discordService.sendToUserWebhook(
          receiver.discordWebhookUrl,
          {
            title: '🤝 Новая заявка в друзья!',
            description: `Пользователь **@${sender?.username || 'Аноним'}** хочет добавить вас в друзья на сайте.`,
            color: 3447003, // Синий цвет
          },
        );
      }
    } catch (err) {
      console.error('Ошибка Дискорда при запросе дружбы:', err.message);
    }

    return { message: 'Заявка на дружбу отправлена' };
  }

  async acceptFriendRequest(userId: number, friendId: number) {
    const request = await this.prismaService.friend.findFirst({
      where: {
        friendId: userId,
        userId: friendId,
        status: 'PENDING',
      },
    });

    if (!request) throw new NotFoundException('Запрос дружбы не найден');

    await this.prismaService.friend.update({
      where: { id: request.id },
      data: {
        status: 'ACCEPTED',
      },
    });

    await this.timelineService.createEvent(
      userId,
      friendId,
      ActionType.ADDED_FRIEND,
      EntityType.FRIEND,
    );

    try {
      // Пользователь, который принял — это userId. Изначальный отправитель — это friendId.
      const accepter = await this.prismaService.user.findUnique({
        where: { id: userId },
      });
      const sender = await this.prismaService.user.findUnique({
        where: { id: friendId },
      });

      if (sender?.notificationsEnabled && sender?.discordWebhookUrl) {
        await this.discordService.sendToUserWebhook(sender.discordWebhookUrl, {
          title: '🎉 Заявка в друзья принята!',
          description: `Пользователь **@${accepter?.username || 'Аноним'}** одобрил вашу заявку. Теперь вы друзья!`,
          color: 5763719, // Зеленый цвет
        });
      }
    } catch (err) {
      console.error('Ошибка Дискорда при одобрении дружбы:', err.message);
    }

    return { message: 'Заявка на дружбу одобрена' };
  }

  async rejectFriendRequest(userId: number, friendId: number) {
    const request = await this.prismaService.friend.findFirst({
      where: {
        friendId: userId,
        userId: friendId,
        status: 'PENDING',
      },
    });

    if (!request) throw new NotFoundException('Запрос дружбы не найден');

    await this.prismaService.friend.delete({
      where: { id: request.id },
    });

    return { message: 'Заявка на дружбу отклонена' };
  }

  async removeFriend(userId: number, friendId: number) {
    const friendRelation = await this.prismaService.friend.findFirst({
      where: {
        OR: [
          { userId: userId, friendId: friendId, status: 'ACCEPTED' },
          { userId: friendId, friendId: userId, status: 'ACCEPTED' },
        ],
      },
    });

    if (!friendRelation) {
      throw new NotFoundException('Друг не найден');
    }

    await this.prismaService.friend.delete({
      where: { id: friendRelation.id },
    });

    return { message: 'Пользователь удален из друзей' };
  }

  async blockFriend(userId: number, blockedUserId: number) {
    const existing = await this.prismaService.friend.findFirst({
      where: {
        OR: [
          { userId: userId, friendId: blockedUserId },
          { userId: blockedUserId, friendId: userId },
        ],
      },
    });

    if (existing) {
      await this.prismaService.friend.update({
        where: { id: existing.id },
        data: {
          userId,
          friendId: blockedUserId,
          status: 'BLOCKED',
        },
      });
    } else {
      await this.prismaService.friend.create({
        data: {
          userId,
          friendId: blockedUserId,
          status: 'BLOCKED',
        },
      });
    }

    return { message: 'Пользователь заблокирован' };
  }

  async getFriends(userId: number) {
    const friends = await this.prismaService.friend.findMany({
      where: {
        OR: [
          { userId, status: 'ACCEPTED' },
          { friendId: userId, status: 'ACCEPTED' },
        ],
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatar: true,
            bio: true,
          },
        },
        friend: {
          select: {
            id: true,
            username: true,
            avatar: true,
            bio: true,
          },
        },
      },
    });

    return friends.map((f) => {
      if (f.userId === userId) {
        return f.friend;
      } else {
        return f.user;
      }
    });
  }

  async getIncomingRequests(userId: number) {
    return this.prismaService.friend.findMany({
      where: {
        friendId: userId,
        status: 'PENDING',
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatar: true,
            bio: true,
          },
        },
      },
    });
  }
}
