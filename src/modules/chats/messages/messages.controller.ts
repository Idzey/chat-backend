import { MessagesService } from "./messages.service";
import {
  BadRequestException,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from "@nestjs/swagger";
import { UserPayload } from "interfaces/auth/userPayload";
import { User } from "src/common/decorators/user";
import { JwtAuthGuard } from "src/common/guards/jwt-auth.guard";

@ApiTags("messages")
@ApiBearerAuth()
@Controller("/chats/:chatId/messages")
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @ApiOperation({ summary: "Get messages in a chat (paginated)" })
  @ApiParam({ name: "chatId", description: "Chat ID" })
  @ApiResponse({ status: 200, description: "List of messages" })
  @UseGuards(JwtAuthGuard)
  @Get()
  getMessages(
    @User() user: UserPayload,
    @Param("chatId") chatId: string,
    @Param("limit") limit: number = 50,
    @Param("offset") offset: number = 0,
  ) {
    if (!chatId) {
      throw new BadRequestException("Chat ID is required");
    }

    return this.messagesService.getMessages(user.id, chatId, limit, offset);
  }

  @ApiOperation({ summary: "Create a message in a chat (REST fallback)" })
  @ApiParam({ name: "chatId", description: "Chat ID" })
  @ApiResponse({ status: 201, description: "Created message" })
  @UseGuards(JwtAuthGuard)
  @Post()
  createMessage(
    @User() user: UserPayload,
    @Param("chatId") chatId: string,
    @Param("content") content: string,
    @Param("type") type: "TEXT" | "IMAGE" | "FILE" | "VOICE" | "VIDEO",
  ) {
    if (!chatId || !content || !type) {
      throw new BadRequestException("Chat ID, content and type are required");
    }

    return this.messagesService.createMessage(user.id, chatId, content, type);
  }

  @ApiOperation({ summary: "Get a single message by ID" })
  @ApiParam({ name: "chatId", description: "Chat ID" })
  @ApiParam({ name: "messageId", description: "Message ID" })
  @UseGuards(JwtAuthGuard)
  @Get(":messageId")
  getMessage(
    @User() user: UserPayload,
    @Param("chatId") chatId: string,
    @Param("messageId") messageId: string,
  ) {
    if (!chatId || !messageId) {
      throw new BadRequestException("Chat ID and message ID are required");
    }

    return this.messagesService.getMessage(user.id, chatId, messageId);
  }

  @ApiOperation({ summary: "Delete a message" })
  @ApiParam({ name: "chatId", description: "Chat ID" })
  @ApiParam({ name: "messageId", description: "Message ID" })
  @UseGuards(JwtAuthGuard)
  @Delete(":messageId")
  deleteMessage(
    @User() user: UserPayload,
    @Param("chatId") chatId: string,
    @Param("messageId") messageId: string,
  ) {
    if (!chatId || !messageId) {
      throw new BadRequestException("Chat ID and message ID are required");
    }

    return this.messagesService.deleteMessage(user.id, chatId, messageId);
  }

  @ApiOperation({ summary: "Edit a message content" })
  @ApiParam({ name: "chatId", description: "Chat ID" })
  @ApiParam({ name: "messageId", description: "Message ID" })
  @UseGuards(JwtAuthGuard)
  @Patch(":messageId")
  updateMessage(
    @User() user: UserPayload,
    @Param("chatId") chatId: string,
    @Param("messageId") messageId: string,
    @Param("content") content: string,
  ) {
    if (!chatId || !messageId || !content) {
      throw new BadRequestException(
        "Chat ID, message ID and content are required",
      );
    }

    return this.messagesService.updateMessage(
      user.id,
      chatId,
      messageId,
      content,
    );
  }

  @ApiOperation({ summary: "Mark a message as read" })
  @ApiParam({ name: "chatId", description: "Chat ID" })
  @ApiParam({ name: "messageId", description: "Message ID" })
  @UseGuards(JwtAuthGuard)
  @Post(":messageId/read")
  markMessageAsRead(
    @User() user: UserPayload,
    @Param("chatId") chatId: string,
    @Param("messageId") messageId: string,
  ) {
    if (!chatId || !messageId) {
      throw new BadRequestException("Chat ID and message ID are required");
    }

    return this.messagesService.markMessageAsRead(user.id, chatId, messageId);
  }
}
