import { MessagesService } from './../chats/messages/messages.service';
import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/modules/libs/prisma/prisma.service";
import { CreateMessageDto } from "./dto/create-message.dto";
import { Server, Socket } from "socket.io";
import { ChatsService } from "../chats/chats.service";
import { Message } from '@prisma/client';

@Injectable()
export class SocketService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ChatsService: ChatsService,
    private readonly MessagesService: MessagesService
  ) {}

  async sendMessage(userId: string, dto: CreateMessageDto) {
  return this.prisma.message.create({
    data: {
      chatId: dto.chatId,
      userId,
      content: dto.content ?? "",
      type: dto.type,
      fileId: dto.fileId ?? null,
    },
    include: { file: true, sender: true },
  });
}

  connectUser(userId: string, socket: Socket) {
    void socket.join(`user:${userId}`);
  }

  joinChat(chatId: string, client: Socket) {
    void client.join(`chat:${chatId}`);
  }

  leaveChat(chatId: string, client: Socket) {
    void client.leave(`chat:${chatId}`);
  }

  getUserChats(userId: string) {
    return this.ChatsService.getUserChats(userId);
  }

  sendMessageNotification(
    userId: string,
    message: Message,
    io: Server
  ) {
    void io.to(`user:${userId}`).emit("notification", message);
  }


}
