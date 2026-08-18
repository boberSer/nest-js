import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { ReviewResponseDto } from './dto/review-response.dto';
import { TimelineService } from '../timeline/timeline.service';
import { ActionType, EntityType } from '../../generated/prisma/enums';

@Injectable()
export class ReviewService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly timelineService: TimelineService,
  ) {}

  private async updateGameRating(gameId: number) {
    const result = await this.prismaService.review.aggregate({
      where: { gameId },
      _avg: { rating: true },
      _count: true,
    });

    const avgRating = result._avg.rating || 0;
    const reviewsCount = result._count;

    await this.prismaService.review.update({
      where: { id: gameId },
      data: {
        rating: avgRating,
      },
    });

    return { avgRating, reviewsCount };
  }

  async sendReview(userId: number, dto: CreateReviewDto) {
    const { gameId, subcategoryId, rating, comment } = dto;
    const game = await this.prismaService.game.findUnique({
      where: { id: +gameId },
    });

    if (!game) throw new NotFoundException('Игра не найдена');

    let currSubcategory: number | null = null;
    if (subcategoryId) {
      const subcategory = await this.prismaService.subcategory.findFirst({
        where: { id: +subcategoryId, gameId: +gameId },
      });
      if (!subcategory) throw new NotFoundException('Подкатегория не найдена');
      currSubcategory = subcategoryId;
    }

    const exist = await this.prismaService.review.findFirst({
      where: { userId, gameId: +gameId },
    });

    let review: ReviewResponseDto;

    if (exist) {
      review = await this.prismaService.review.update({
        where: { id: exist.id },
        data: {
          rating,
          comment: comment || null,
          subcategoryId: currSubcategory,
        },
      });
    } else {
      review = await this.prismaService.review.create({
        data: {
          userId,
          gameId,
          subcategoryId: currSubcategory,
          rating,
          comment: comment || null,
        },
      });
    }

    await this.updateGameRating(gameId);
    await this.timelineService.createEvent(
      userId,
      review.id,
      ActionType.RATED_GAME,
      EntityType.REVIEW,
    );

    return review;
  }

  async getReviews(gameId: number) {
    const game = await this.prismaService.game.findUnique({
      where: { id: +gameId },
    });

    if (!game) throw new NotFoundException('Игра не найдена');

    return this.prismaService.review.findMany({
      where: { id: gameId },
    });
  }
}
