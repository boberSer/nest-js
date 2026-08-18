import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

export enum DiscordNotificationType {
  REGISTRATION = 'REGISTRATION',
  ACHIEVEMENT = 'ACHIEVEMENT',
  MOMENT = 'MOMENT',
}

@Injectable()
export class DiscordService {
  private readonly logger = new Logger(DiscordService.name);

  constructor(private readonly httpService: HttpService) {}

  async send(type: DiscordNotificationType, embedPayload: any): Promise<void> {
    let webhookUrl: string | undefined;

    switch (type) {
      case DiscordNotificationType.REGISTRATION:
        webhookUrl = process.env.DISCORD_REGISTRATION_WEBHOOK_URL;
        break;
      case DiscordNotificationType.ACHIEVEMENT:
        webhookUrl = process.env.DISCORD_ACHIEVEMENT_WEBHOOK_URL;
        break;
      case DiscordNotificationType.MOMENT:
        webhookUrl = process.env.DISCORD_MOMENT_WEBHOOK_URL;
        break;
    }

    if (!webhookUrl) {
      this.logger.warn(`Вебхук для типа ${type} не настроен в .env`);
      return;
    }

    // 1. Создаем чистый объект без undefined полей, которые ломают Дискорд
    const cleanEmbed = JSON.parse(
      JSON.stringify({
        title: embedPayload.title ? String(embedPayload.title) : undefined,
        description: embedPayload.description
          ? String(embedPayload.description)
          : undefined,
        color: embedPayload.color ? Number(embedPayload.color) : 3447003, // Проверяем, что это строго число
        fields: embedPayload.fields?.map((f: any) => ({
          name: String(f.name || 'Поле'),
          value: String(f.value || 'Пусто'),
          inline: !!f.inline,
        })),
        image: embedPayload.image?.url
          ? { url: String(embedPayload.image.url) }
          : undefined,
        thumbnail: embedPayload.thumbnail?.url
          ? { url: String(embedPayload.thumbnail.url) }
          : undefined,
        timestamp: new Date().toISOString(),
      }),
    );

    try {
      await firstValueFrom(
        this.httpService.post(webhookUrl, {
          embeds: [cleanEmbed],
        }),
      );
    } catch (error) {
      const discordErrorMessage = error.response?.data
        ? JSON.stringify(error.response.data)
        : error.message;
      this.logger.error(
        `Не удалось отправить уведомление в Discord: ${error.message}, Причина: ${discordErrorMessage}`,
      );
    }
  }
}
