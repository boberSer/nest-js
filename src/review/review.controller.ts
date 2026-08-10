import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ReviewService } from './review.service';
import { User } from '../auth/decorators/user.decorator';
import { CreateReviewDto } from './dto/create-review.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtGuard } from '../auth/guards/auth.guard';

@Controller('reviews')
@ApiBearerAuth()
@UseGuards(JwtGuard)
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Post()
  async sendReview(@User('id') userId: number, @Body() dto: CreateReviewDto) {
    return this.reviewService.sendReview(userId, dto);
  }

  @Get(':gameId')
  async getReview(@Param('gameId') gameId: number) {
    return this.reviewService.getReviews(gameId);
  }
}
