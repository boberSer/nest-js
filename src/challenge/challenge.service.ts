import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateChallengeDto } from './dto/create-challenge.dto';
import { UpdateChallengeDto } from './dto/update-challenge.dto';
import { UpdateProgressDto } from './dto/update-progress.dto';

@Injectable()
export class ChallengeService {
  constructor(private readonly prismaService: PrismaService) {}

  async getChallenges(userId: number) {
    return this.prismaService.challenge.findMany({
      where: { userId },
      select: {
        id: true,
        title: true,
        description: true,
        targetValue: true,
        currentValue: true,
        deadline: true,
        isCompleted: true,
        completedAt: true,
        createdAt: true,
        updatedAt: true,
        game: true,
      },
    });
  }

  async create(userId: number, gameId: number, dto: CreateChallengeDto) {
    const { title, description, targetValue, deadline } = dto;

    const game = await this.prismaService.game.findUnique({
      where: { id: +gameId },
    });

    if (!game) throw new NotFoundException('Игра не найдена');

    const existing = await this.prismaService.challenge.findFirst({
      where: {
        userId,
        gameId,
        title,
        isCompleted: false,
      },
    });

    if (existing)
      throw new ConflictException(
        'У вас уже есть активный челлендж с таким названием',
      );

    return this.prismaService.challenge.create({
      data: {
        userId,
        gameId,
        title,
        description: description || null,
        targetValue,
        deadline: deadline || null,
      },
    });
  }

  async completeChallenge(userId: number, challengeId: number) {
    const challenge = await this.prismaService.challenge.findFirst({
      where: {
        id: challengeId,
        userId,
      },
    });

    if (!challenge) throw new NotFoundException('Челлендж не найден');

    if (challenge.isCompleted)
      throw new ConflictException('Челлендж уже выполнен');

    return this.prismaService.challenge.update({
      where: { id: +challengeId },
      data: {
        isCompleted: true,
        completedAt: new Date(),
        currentValue: challenge.targetValue,
      },
    });
  }

  async update(userId: number, challengeId: number, dto: UpdateChallengeDto) {
    const { title, description, targetValue, deadline, currentValue } = dto;
    const challenge = await this.prismaService.challenge.findFirst({
      where: { id: +challengeId, userId },
    });

    if (!challenge) throw new NotFoundException('Челлендж не найден');

    if (challenge.isCompleted)
      throw new ConflictException('Челлендж уже выполнен');

    const finalCurrentValue =
      currentValue !== undefined ? currentValue : challenge.currentValue;
    const finalTargetValue =
      targetValue !== undefined ? targetValue : challenge.targetValue;

    const isCompleted = finalCurrentValue >= finalTargetValue;

    return this.prismaService.challenge.update({
      where: { id: +challengeId },
      data: {
        title,
        description: description || null,
        targetValue,
        deadline: deadline || null,
        currentValue,
        isCompleted,
      },
    });
  }

  async updateProgress(
    userId: number,
    challengeId: number,
    progress: UpdateProgressDto,
  ) {
    const challenge = await this.prismaService.challenge.findFirst({
      where: {
        id: challengeId,
        userId,
      },
    });

    if (!challenge) throw new NotFoundException('Челлендж не найден');

    if (challenge.isCompleted)
      throw new ConflictException('Челлендж уже выполнен');

    const newProgress = Math.min(progress.currentValue, challenge.targetValue);
    const isCompleted = newProgress >= challenge.targetValue;

    return this.prismaService.challenge.update({
      where: { id: challengeId },
      data: {
        currentValue: newProgress,
        isCompleted,
        completedAt: isCompleted ? new Date() : null,
      },
    });
  }
}
