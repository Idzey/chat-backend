import { BadRequestException, Injectable } from "@nestjs/common";
import { MessageType } from "@prisma/client";
import { PrismaService } from "src/modules/libs/prisma/prisma.service";
import { isUUID } from "validator";

@Injectable()
export class MessagesService {
    constructor(private readonly prisma: PrismaService) {}

    private async checkUserInChat(userId: string, chatId: string) {
        if (!isUUID(chatId)) {
            throw new BadRequestException('Invalid chat ID format');
        }

         const userChat = await this.prisma.userChat.findFirst({
            where: {
                userId: userId,
                chatId: chatId,
            },
        });

        if (!userChat) {
            throw new BadRequestException('You are not a member of this chat');
        }
    }

    async getMessages(userId: string, chatId: string, limit: number, offset: number) {
        await this.checkUserInChat(userId, chatId);

        const messages = await this.prisma.message.findMany({
            where: {
                chatId: chatId,
            },
            take: limit,
            skip: offset,
            orderBy: { createdAt: 'asc' },
        });

        return messages;
    }

    async createMessage(
        userId: string,
        chatId: string,
        content: string,
        type: MessageType,
    ) {
        await this.checkUserInChat(userId, chatId);

        const message = await this.prisma.message.create({
            data: {
                content,
                type,
                chatId,
                userId,
            },
        });

        return message;
    }

    async getMessage(userId: string, chatId: string, messageId: string) {
        await this.checkUserInChat(userId, chatId);

        const message = await this.prisma.message.findFirst({
            where: {
                id: messageId,
                chatId: chatId,
            },
        });

        if (!message) {
            throw new BadRequestException('Message not found or you do not have permission to view it');
        }
        
        return message;
    }

    async deleteMessage(userId: string, chatId: string, messageId: string) {
        await this.checkUserInChat(userId, chatId);

        const message = await this.prisma.message.findFirst({
            where: {
                id: messageId,
                chatId: chatId,
                userId,
            },
        });

        if (!message) {
            throw new BadRequestException('Message not found or you do not have permission to delete it');
        }

        await this.prisma.message.delete({
            where: { id: messageId },
        });

        return { success: true };
    }

    async updateMessage(
        userId: string,
        chatId: string,
        messageId: string,
        content: string,
    ) {
        await this.checkUserInChat(userId, chatId);

        const message = await this.prisma.message.findFirst({
            where: {
                id: messageId,
                chatId: chatId,
                userId,
            },
        });

        if (!message) {
            throw new BadRequestException('Message not found or you do not have permission to update it');
        }

        const updatedMessage = await this.prisma.message.update({
            where: { id: messageId },
            data: { content },
        });

        return updatedMessage;
    }


    async markMessageAsRead(
        userId: string,
        chatId: string,
        messageId: string,
    ) {
        await this.checkUserInChat(userId, chatId);

        const message = await this.prisma.message.findFirst({
            where: {
                id: messageId,
                chatId: chatId,
            },
        });

        if (!message) {
            throw new BadRequestException('Message not found or you do not have permission to mark it as read');
        }

        await this.prisma.userChat.update({
            where: {
                userId_chatId: {
                    userId: userId,
                    chatId: chatId,
                },
            },
            data: {
                lastReadAt: new Date(),
            },
        });

        // await this.prisma.message.update({
        //     where: { id: messageId },
        //     data: { isRead: true },
        // });

        return { success: true };
    }

    async getLastMessage(chatId: string) {
        const lastMessage = await this.prisma.message.findFirst({
            where: { chatId: chatId },
            orderBy: { createdAt: 'desc' },
        });

        return lastMessage;
    }
}