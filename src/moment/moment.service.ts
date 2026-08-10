import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UploadService } from '../upload/upload.service';
import { CreateMomentDto } from './dto/create-moment.dto';

@Injectable()
export class MomentService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly uploadService: UploadService,
  ) {}

  async create(
    userId: number,
    dto: CreateMomentDto,
    file?: Express.Multer.File,
  ) {
    const { gameId, subcategoryId, caption } = dto;

    const game = await this.prismaService.game.findUnique({
      where: { id: gameId },
    });

    if (!game) throw new NotFoundException('Игра не найдена');

    let validSubcategoryId: number | null = null;
    if (subcategoryId) {
      const subcategory = await this.prismaService.subcategory.findFirst({
        where: { id: +subcategoryId, gameId: +gameId },
      });

      if (!subcategory) throw new NotFoundException('Подкатегория не найдена');
      validSubcategoryId = subcategoryId;
    }

    if (!file) {
      throw new BadRequestException('Изображение обязательно');
    }

    const uploadResult = this.uploadService.upload(file, 'moments');
    const imageUrl = uploadResult.path;

    return this.prismaService.moment.create({
      data: {
        userId,
        gameId,
        subcategoryId: validSubcategoryId,
        imageUrl,
        caption,
      },
    });
  }

  async likeMoment(userId: number, momentId: number) {
    const moment = await this.prismaService.moment.findUnique({
      where: { id: momentId },
    });

    if (!moment) throw new NotFoundException('Момент не найден');

    const existingLike = await this.prismaService.momentLike.findUnique({
      where: {
        momentId_userId: {
          momentId,
          userId,
        },
      },
    });

    if (existingLike) {
      throw new ConflictException('Вы уже поставили лайк этому моменту');
    }

    return this.prismaService.momentLike.create({
      data: {
        momentId,
        userId,
      },
    });
  }
}
