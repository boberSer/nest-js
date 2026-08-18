import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTagDto } from './dto/create-tag.dto';

@Injectable()
export class TagService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(dto: CreateTagDto) {
    const existing = await this.prismaService.tag.findFirst({
      where: { name: dto.name.trim() },
    });

    if (existing) {
      throw new ConflictException(`Тег "${dto.name}" уже существует`);
    }

    const name = dto.name.startsWith('#') ? dto.name : `#${dto.name}`;

    return this.prismaService.tag.create({
      data: { name },
    });
  }

  async addTag(gameId: number, tagId: number) {
    const game = await this.prismaService.game.findUnique({
      where: { id: +gameId },
    });

    if (!game) throw new NotFoundException('Игра не найдена');

    const tag = await this.prismaService.tag.findUnique({
      where: { id: tagId },
    });

    if (!tag) {
      throw new NotFoundException('Тег не найден');
    }

    const existing = await this.prismaService.gameTag.findFirst({
      where: {
        gameId,
        tagId,
      },
    });

    if (existing) {
      throw new ConflictException('Этот тег уже добавлен к игре');
    }

    return this.prismaService.gameTag.create({
      data: {
        gameId: +gameId,
        tagId,
      },
    });
  }

  async getTags() {
    return this.prismaService.tag.findMany();
  }
}
