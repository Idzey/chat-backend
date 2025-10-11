import { MessagesService } from './messages.service';
import { BadRequestException, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { UserPayload } from 'interfaces/auth/userPayload';
import { User } from 'src/common/decorators/user';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@Controller('/chats/:chatId/messages')
export class MessagesController {
    constructor(private readonly messagesService: MessagesService) { }

    @UseGuards(JwtAuthGuard)
    @Get()
    getMessages(
        @User() user: UserPayload,
        @Param('chatId') chatId: string,
        @Param('limit') limit: number = 50,
        @Param('offset') offset: number = 0,
    ) {
        if (!chatId) {
            throw new BadRequestException('Chat ID is required');
        }

        return this.messagesService.getMessages(
            user.id,
            chatId,
            limit,
            offset,
        );
    }

    @UseGuards(JwtAuthGuard)
    @Post()
    createMessage(
        @User() user: UserPayload,
        @Param('chatId') chatId: string,
        @Param('content') content: string,
        @Param('type') type: 'TEXT' | 'IMAGE' | 'FILE' | 'VOICE' | 'VIDEO',
    ) {
        if (!chatId || !content || !type) {
            throw new BadRequestException('Chat ID, content and type are required');
        }

        return this.messagesService.createMessage(
            user.id,
            chatId,
            content,
            type,
        );
    }

    @UseGuards(JwtAuthGuard)
    @Get(':messageId')
    getMessage(
        @User() user: UserPayload,
        @Param('chatId') chatId: string,
        @Param('messageId') messageId: string,
    ) {
        if (!chatId || !messageId) {
            throw new BadRequestException('Chat ID and message ID are required');
        }

        return this.messagesService.getMessage(
            user.id,
            chatId,
            messageId,
        );
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':messageId')
    deleteMessage(
        @User() user: UserPayload,
        @Param('chatId') chatId: string,
        @Param('messageId') messageId: string,
    ) {
        if (!chatId || !messageId) {
            throw new BadRequestException('Chat ID and message ID are required');
        }

        return this.messagesService.deleteMessage(
            user.id,
            chatId,
            messageId,
        );
    }

    @UseGuards(JwtAuthGuard)
    @Patch(':messageId')
    updateMessage(
        @User() user: UserPayload,
        @Param('chatId') chatId: string,
        @Param('messageId') messageId: string,
        @Param('content') content: string,
    ) {
        if (!chatId || !messageId || !content) {
            throw new BadRequestException('Chat ID, message ID and content are required');
        }

        return this.messagesService.updateMessage(
            user.id,
            chatId,
            messageId,
            content,
        );
    }

    @UseGuards(JwtAuthGuard)
    @Post(':messageId/read')
    markMessageAsRead(
        @User() user: UserPayload,
        @Param('chatId') chatId: string,
        @Param('messageId') messageId: string,
    ) {
        if (!chatId || !messageId) {
            throw new BadRequestException('Chat ID and message ID are required');
        }

        return this.messagesService.markMessageAsRead(
            user.id,
            chatId,
            messageId,
        );
    }

}