import { MessagesService } from "./messages/messages.service";
import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "../libs/prisma/prisma.service";
import {
  AddUserToChatDto,
  CreateChatDto,
  UpdateChatDto,
} from "./dto/chats.dto";
import { isUUID } from "validator";

@Injectable()
export class ChatsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly messagesService: MessagesService,
  ) {}

  private checkChatUUID(chatId: string) {
    if (!isUUID(chatId)) {
      throw new BadRequestException("Invalid chat ID format");
    }
  }

  async getUserChats(userId: string) {
    const chats = await this.prisma.chat.findMany({
      where: {
          participants: { some: { userId } }
      },
      select: {
        id: true,
        name: true,
        avatar: true,
        type: true,
      },
    });


    const newChats = await Promise.all(
      chats.map(async (chat) => ({
        ...chat,
        lastMessage: await this.messagesService.getLastMessage(chat.id),
        unreadCount: 2,
        name: chat.name || (
          chat.type === 'PRIVATE' ? (
            await this.prisma.userChat.findFirst({
              where: {
                chatId: chat.id,
                userId: { not: userId }
              },
              include: { user: true }
            })
          )?.user.name : 'Group Chat'
        ),
      }))
    );
    console.log(newChats);

    return newChats;
  }

  async addUserToChat(chatId: string, dto: AddUserToChatDto) {
    this.checkChatUUID(chatId);

    const { userId } = dto;

    return await this.prisma.userChat.create({
      data: {
        userId,
        chatId,
      },
    });
  }

  async removeUserFromChat(userId: string, chatId: string) {
    this.checkChatUUID(chatId);

    return await this.prisma.userChat.delete({
      where: {
        userId_chatId: {
          userId,
          chatId,
        },
      },
    });
  }

  async updateParticipantRole(
    userId: string,
    chatId: string,
    role: "MODERATOR" | "ADMIN" | "MEMBER"
  ) {
    this.checkChatUUID(chatId);

    return await this.prisma.userChat.update({
      where: {
        userId_chatId: {
          userId,
          chatId,
        },
      },
      data: {
        role,
      },
    });
  }

  async createChat(userId: string, dto: CreateChatDto) {
    const { name, participantIds } = dto;

    const allParticipantIds = Array.from(
      new Set([userId, ...(participantIds ?? [])])
    );

    const chat = await this.prisma.chat.create({
      data: {
        name,
        participants: {
          create: allParticipantIds.map((id) => ({
            userId: id,
          })),
        },
      },
    });

    return chat;
  }

  async getChatById(userId: string, chatId: string) {
    this.checkChatUUID(chatId);

    const chat = await this.prisma.chat.findUnique({
      where: {
        id: chatId,
        participants: {
          some: {
            userId: userId,
          },
        },
      },
      include: {
        participants: {
          include: {
            user: true,
          },
        },
        messages: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!chat) {
      throw new Error("Chat not found");
    }

    return chat;
  }

  async deleteChat(chatId: string, userId: string) {
    await this.getChatById(userId, chatId);

    await this.prisma.chat.delete({
      where: { id: chatId },
    });

    return { success: true };
  }

  async updateChat(userId: string, chatId: string, dto: UpdateChatDto) {
    const { name } = dto;

    await this.getChatById(userId, chatId);

    const updatedChat = await this.prisma.chat.update({
      where: { id: chatId },
      data: { name },
    });

    return updatedChat;
  }

  async markAsRead(chatId: string, userId: string) {
    await this.getChatById(userId, chatId);

    await this.prisma.userChat.update({
      where: {
        userId_chatId: {
          userId,
          chatId,
        },
      },
      data: {
        lastReadAt: new Date(),
      },
    });

    return { success: true };
  }

  async getOrCreatePrivateChat(userId: string, otherUserId: string) {
    if (!isUUID(otherUserId)) {
      throw new BadRequestException("Invalid user ID format");
    }

    const chat = await this.prisma.chat.findFirst({
      where: {
        participants: {
          every: {
            userId: {
              in: [userId, otherUserId],
            },
          },
        },
      },
      include: {
        participants: true,
      },
    });

    if (chat) {
      return chat.id;
    }

    const newChat = await this.createChat(userId, {
      participantIds: [otherUserId],
    });

    return newChat.id;
  }
}
