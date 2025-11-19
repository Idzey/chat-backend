import { MessagesService } from './../chats/messages/messages.service';
import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/modules/libs/prisma/prisma.service";
import { CreateMessageDto } from "./dto/create-message.dto";
import { Server, Socket } from "socket.io";
import { Message } from "@prisma/client";
import { ChatsService } from "../chats/chats.service";
@Injectable()
export class SocketService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ChatsService: ChatsService,
    private readonly MessagesService: MessagesService
  ) {}

  async sendMessage(userId: string, dto: CreateMessageDto) {
    const { chatId, content, type } = dto;
    const createdMessage = await this.MessagesService.createMessage(
      userId,
      chatId,
      content,
      type
    );

    return createdMessage;
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
