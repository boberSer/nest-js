import {
  ConnectedSocket,
  MessageBody,
  type OnGatewayConnection,
  type OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { ChatService } from './chat.service';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { SendMessageDto } from './dto/send-message.dto';
import { User } from '../auth/decorators/user.decorator';

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(ChatGateway.name);
  @WebSocketServer() server: Server;

  constructor(private readonly chatService: ChatService) {}

  private userSockets = new Map<number, string>();

  handleConnection(client: Socket) {
    // Безопасно достаем userId из Query параметров (?userId=1)
    const rawUserId = client.handshake.query?.userId;
    const userIdString = Array.isArray(rawUserId) ? rawUserId[0] : rawUserId;
    const userId = userIdString ? Number(userIdString) : null;

    if (userId && !isNaN(userId)) {
      // Запоминаем, что этот юзер сейчас на этом сокете
      this.userSockets.set(userId, client.id);
      this.logger.log(
        `Пользователь ${userId} подключился (Socket: ${client.id})`,
      );
    } else {
      this.logger.log(`Анонимный клиент подключился: ${client.id}`);
    }
  }

  handleDisconnect(client: Socket) {
    // Когда клиент отключается, находим его в карте и удаляем
    for (const [userId, socketId] of this.userSockets.entries()) {
      if (socketId === client.id) {
        this.userSockets.delete(userId);
        this.logger.log(`Пользователь ${userId} отключился`);
        break;
      }
    }
  }

  @SubscribeMessage('send')
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() dto: SendMessageDto,
  ) {
    // Достаем ID отправителя из текущего сокета
    const rawUserId = client.handshake.query?.userId;
    const userIdString = Array.isArray(rawUserId) ? rawUserId[0] : rawUserId;
    const senderId = userIdString ? Number(userIdString) : 1;

    // 1. Сохраняем сообщение в базу данных Prisma через твой сервис
    const message = await this.chatService.sendMessage(senderId, dto);

    // 2. Ищем Socket ID получателя в нашей карте онлайна
    const receiverSocketId = this.userSockets.get(dto.receiverId);

    if (receiverSocketId) {
      // Шлем сообщение в реальном времени СТРОГО получателю
      this.server.to(receiverSocketId).emit('messages', message);
    }

    // 3. Отправляем сообщение обратно самому отправителю.
    // Это нужно фронтенду, чтобы мгновенно отобразить отправленное сообщение в окне чата
    client.emit('messages', message);

    this.logger.log(
      `Сообщение от ${senderId} для ${dto.receiverId}: ${message.content}`,
    );
    return message;
  }

  @SubscribeMessage('read_chat')
  async handleReadChat(
    @MessageBody() dto: { senderId: number }, // ID того, чьи сообщения мы читаем
    @ConnectedSocket() client: Socket,
  ) {
    const rawUserId = client.handshake.query?.userId;
    const userIdString = Array.isArray(rawUserId) ? rawUserId : rawUserId;
    const currentUserId = userIdString ? Number(userIdString) : null;

    if (!currentUserId || isNaN(currentUserId)) return;

    await this.chatService.markAsRead(currentUserId, dto.senderId);

    const senderSocketId = this.userSockets.get(dto.senderId);
    if (senderSocketId) {
      this.server.to(senderSocketId).emit('chat_read_by_user', {
        readerId: currentUserId, // Кто прочитал
      });
    }

    this.logger.log(
      `Пользователь ${currentUserId} прочитал сообщения от ${dto.senderId}`,
    );
    return { success: true };
  }
}
