import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UploadService } from '../upload/upload.service';
import { SubcategoryRequest } from './dto/subcategory-request.dto';
import { SubcategoryResponse } from './dto/subcategory-response.dto';

@Injectable()
class SubcategoryService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly uploadService: UploadService,
  ) {}

  async create(
    id: number,
    dto: SubcategoryRequest,
    file?: Express.Multer.File,
  ): Promise<SubcategoryResponse> {
    const { name, type, description } = dto;

    const game = await this.prismaService.game.findUnique({
      where: { id: +id },
    });

    if (!game) throw new NotFoundException('Игра не найдена');

    let coverImage: string | null = null;

    if (file) {
      const uploadResult = this.uploadService.upload(file, 'subcategories');
      coverImage = uploadResult.path;
    }

    return this.prismaService.subcategory.create({
      data: {
        gameId: +id,
        name,
        type,
        image: coverImage,
        description,
      },
    });
  }

  async update(
    id: number,
    gameId: number,
    dto: SubcategoryRequest,
    file?: Express.Multer.File,
  ): Promise<SubcategoryResponse> {
    const subcategory = await this.prismaService.subcategory.findUnique({
      where: { id: +id, gameId: +gameId },
      include: { game: true },
    });

    let coverImage: string | null = null;

    if (file) {
      const uploadResult = this.uploadService.upload(file, 'subcategories');
      coverImage = uploadResult.path;
    }

    if (!subcategory) throw new NotFoundException('Подкатегория не найдена');

    return this.prismaService.subcategory.update({
      where: { id: +id },
      data: {
        ...dto,
        image: coverImage,
      },
    });
  }

  async delete(id: number, gameId: number) {
    const subcategory = await this.prismaService.subcategory.findUnique({
      where: { id: +id, gameId: +gameId },
      include: { game: true },
    });

    if (!subcategory) throw new NotFoundException('Подкатегория не найдена');

    return this.prismaService.subcategory.delete({
      where: { id: +id },
    });
  }
}

export default SubcategoryService;
