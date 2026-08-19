import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SendMessageDto } from './dto/send-message.dto';

@Injectable()
export class ChatService {
  constructor(private readonly prismaService: PrismaService) {}

  async sendMessage(userId: number, dto: SendMessageDto) {
    const { content, receiverId } = dto;

    return this.prismaService.chat.create({
      data: {
        senderId: userId,
        receiverId,
        content,
      },
    });
  }

  async markAsRead(receiverId: number, senderId: number) {
    // Меняем статус на TRUE для всех непрочитанных сообщений,
    // где текущий юзер является ПОЛУЧАТЕЛЕМ (receiverId), а его собеседник — ОТПРАВИТЕЛЕМ (senderId)
    await this.prismaService.chat.updateMany({
      where: {
        receiverId: receiverId,
        senderId: senderId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    return { success: true };
  }
}
