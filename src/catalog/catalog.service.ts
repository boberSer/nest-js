import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GameRequest } from './dto/game-request.dto';
import { GameResponse } from './dto/game-response.dto';
import { UploadService } from '../upload/upload.service';
import { StatisticService } from '../statistic/statistic.service';

@Injectable()
export class CatalogService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly uploadService: UploadService,
    private readonly statisticService: StatisticService,
  ) {}

  async findAll(): Promise<GameResponse[]> {
    return this.prismaService.game.findMany({
      include: {
        subcategories: true,
        tags: true,
        reviews: true,
        moments: {
          select: {
            id: true,
            imageUrl: true,
            caption: true,
            likes: true,
            createdAt: true,
            user: {
              select: {
                id: true,
                username: true,
                avatar: true,
              },
            },
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
            _count: {
              select: {
                momentLikes: true,
              },
            },
          },
        },
      },
    });
  }

  async findById(id: number): Promise<GameResponse> {
    const game = await this.prismaService.game.findUnique({
      where: {
        id,
      },
      include: {
        subcategories: true,
        tags: true,
        reviews: true,
        moments: {
          select: {
            id: true,
            imageUrl: true,
            caption: true,
            likes: true,
            createdAt: true,
            user: {
              select: {
                id: true,
                username: true,
                avatar: true,
              },
            },
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
            _count: {
              select: {
                momentLikes: true,
              },
            },
          },
        },
      },
    });

    if (!game) throw new NotFoundException('Игра не найдена');

    return game;
  }
  async findByName(name: string): Promise<GameResponse> {
    const game = await this.prismaService.game.findUnique({
      where: {
        name,
      },
      include: {
        subcategories: true,
        tags: true,
        reviews: true,
      },
    });
    if (!game) throw new NotFoundException('Игра не найдена');

    return game;
  }

  async create(userId: number, dto: GameRequest, file?: Express.Multer.File) {
    const { name, description, genre, releaseYear, developer } = dto;

    const existingGame = await this.prismaService.game.findUnique({
      where: { name: name },
    });

    if (existingGame) {
      throw new ConflictException(
        `Игра с названием '${name}' уже существует. Пожалуйста, используйте другое название.`,
      );
    }

    let coverImage: string | null = null;

    if (file) {
      const uploadResult = this.uploadService.upload(file, 'games');
      coverImage = uploadResult.path;
    }

    const game = await this.prismaService.game.create({
      data: {
        name,
        description,
        genre,
        coverImage,
        releaseYear,
        developer,
      },
    });

    await this.statisticService.updateUserStatistics(userId);

    await this.prismaService.userGame.create({
      data: {
        userId,
        gameId: game.id,
        isActive: true,
        addedAt: new Date(),
      },
    });

    return game;
  }

  async update(
    id: number,
    dto: GameRequest,
    file?: Express.Multer.File,
  ): Promise<GameResponse> {
    const game = await this.findById(id);

    let coverImage: string | null = null;

    if (file) {
      const uploadResult = this.uploadService.upload(file, 'games');
      coverImage = uploadResult.path;
    }

    return this.prismaService.game.update({
      where: {
        id: game.id,
      },
      data: {
        ...dto,
        coverImage,
      },
    });
  }

  async delete(id: number, userId: number): Promise<GameResponse> {
    const game = await this.findById(id);

    if (!game) throw new NotFoundException('Игра не найдена');

    await this.prismaService.userGame.deleteMany({
      where: {
        userId,
        gameId: id,
      },
    });

    await this.prismaService.game.delete({
      where: {
        id: game.id,
      },
    });

    return game;
  }
}
