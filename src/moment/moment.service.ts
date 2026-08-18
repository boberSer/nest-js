import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UploadService } from '../upload/upload.service';
import { CreateMomentDto } from './dto/create-moment.dto';
import { TimelineService } from '../timeline/timeline.service';
import { ActionType, EntityType } from '../../generated/prisma/enums';
import {
  DiscordNotificationType,
  DiscordService,
} from '../discord/discord.service';

@Injectable()
export class MomentService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly uploadService: UploadService,
    private readonly timelineService: TimelineService,
    private readonly discordService: DiscordService,
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

    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
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

    const moment = await this.prismaService.moment.create({
      data: {
        userId,
        gameId,
        subcategoryId: validSubcategoryId,
        imageUrl,
        caption,
      },
    });

    await this.timelineService.createEvent(
      userId,
      moment.id,
      ActionType.POSTED_MOMENT,
      EntityType.MOMENT,
    );

    const baseUrl = process.env.SITE_URL
      ? process.env.SITE_URL.replace(/\/$/, '')
      : null;

    let discordImageUrl: string | undefined = undefined;

    if (baseUrl && moment.imageUrl) {
      discordImageUrl = `${baseUrl}${moment.imageUrl}`;
    }

    await this.discordService.send(DiscordNotificationType.MOMENT, {
      title: '📸 Новый момент в галерее',
      description: `Пользователь **@${user?.username || 'Аноним'}** поделился снимком.\n\n**Описание:** ${moment.caption || 'Без описания.'} \n\n **Название игры:** ${game.name}`,
      color: 3447003,
      image: discordImageUrl ? { url: discordImageUrl } : undefined,
    });

    return moment;
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

  async getMoments() {
    return this.prismaService.moment.findMany({});
  }
}
