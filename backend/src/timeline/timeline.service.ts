import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ActionType, EntityType } from '../../generated/prisma/enums';

@Injectable()
export class TimelineService {
  constructor(private readonly prismaService: PrismaService) {}

  async createEvent(
    userId: number,
    entityId: number,
    actionType: ActionType,
    entityType: EntityType,
  ) {
    return this.prismaService.timeline.create({
      data: {
        userId,
        entityId,
        actionType,
        entityType,
      },
    });
  }

  async getAllEvents(userId: number) {
    return this.prismaService.timeline.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
