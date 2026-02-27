import {
  Body,
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
import { ChatsService } from "./chats.service";
import { User } from "src/common/decorators/user";
import {
  AddUserToChatDto,
  CreateChatDto,
  GetOrCreateChatDto,
  UpdateChatDto,
  UpdateParticipantRoleDto,
} from "./dto/chats.dto";
import { JwtAuthGuard } from "src/common/guards/jwt-auth.guard";
import { UserPayload } from "interfaces/auth/userPayload";

@ApiTags("chats")
@ApiBearerAuth()
@Controller("/chats")
export class ChatsController {
  constructor(private readonly chatsService: ChatsService) {}

  @ApiOperation({ summary: "Get all chats for the current user" })
  @ApiResponse({ status: 200, description: "List of user chats" })
  @UseGuards(JwtAuthGuard)
  @Get("user-chats")
  async getUserChats(@User() user: UserPayload) {
    return await this.chatsService.getUserChats(user.id);
  }

  @ApiOperation({ summary: "Create a new group chat" })
  @ApiResponse({ status: 201, description: "Created chat object" })
  @UseGuards(JwtAuthGuard)
  @Post()
  async createChat(@User() user: UserPayload, @Body() dto: CreateChatDto) {
    return await this.chatsService.createChat(user.id, dto);
  }

  @ApiOperation({ summary: "Get chat by ID" })
  @ApiParam({ name: "chatId", description: "Chat ID" })
  @ApiResponse({ status: 200, description: "Chat object" })
  @UseGuards(JwtAuthGuard)
  @Get(":chatId")
  async getChatById(
    @User() user: UserPayload,
    @Param("chatId") chatId: string,
  ) {
    return await this.chatsService.getChatById(user.id, chatId);
  }

  @ApiOperation({ summary: "Update chat name" })
  @ApiParam({ name: "chatId", description: "Chat ID" })
  @ApiResponse({ status: 200, description: "Updated chat object" })
  @UseGuards(JwtAuthGuard)
  @Patch(":chatId")
  async updateChat(
    @User() user: UserPayload,
    @Param("chatId") chatId: string,
    @Body() dto: UpdateChatDto,
  ) {
    return await this.chatsService.updateChat(user.id, chatId, dto);
  }

  @ApiOperation({ summary: "Delete a chat" })
  @ApiParam({ name: "chatId", description: "Chat ID" })
  @ApiResponse({ status: 200, description: "Chat deleted" })
  @UseGuards(JwtAuthGuard)
  @Delete(":chatId")
  async deleteChat(@User() user: UserPayload, @Param("chatId") chatId: string) {
    return await this.chatsService.deleteChat(chatId, user.id);
  }

  @ApiOperation({ summary: "Add a user to a chat" })
  @ApiParam({ name: "chatId", description: "Chat ID" })
  @Post(":chatId/participants")
  async addUserToChat(
    @Param("chatId") chatId: string,
    @Body() dto: AddUserToChatDto,
  ) {
    return await this.chatsService.addUserToChat(chatId, dto);
  }

  @ApiOperation({ summary: "Remove a user from a chat" })
  @ApiParam({ name: "chatId", description: "Chat ID" })
  @ApiParam({ name: "userId", description: "User ID to remove" })
  @Delete(":chatId/participants/:userId")
  async removeUserFromChat(
    @Param("chatId") chatId: string,
    @Param("userId") userId: string,
  ) {
    return await this.chatsService.removeUserFromChat(userId, chatId);
  }

  @ApiOperation({ summary: "Update participant role in a chat" })
  @ApiParam({ name: "chatId", description: "Chat ID" })
  @ApiParam({ name: "userId", description: "User ID" })
  @Patch(":chatId/participants/:userId/role")
  async updateParticipantRole(
    @Param("chatId") chatId: string,
    @Param("userId") userId: string,
    @Body("role") dto: UpdateParticipantRoleDto,
  ) {
    const { role } = dto;
    return await this.chatsService.updateParticipantRole(userId, chatId, role);
  }

  @ApiOperation({
    summary: "Get or create a private (DM) chat with another user",
  })
  @ApiResponse({ status: 201, description: "Private chat object" })
  @UseGuards(JwtAuthGuard)
  @Post("/private")
  async getOrCreatePrivateChat(
    @User() user: UserPayload,
    @Body() dto: GetOrCreateChatDto,
  ) {
    return await this.chatsService.getOrCreatePrivateChat(user.id, dto.userId);
  }
}
