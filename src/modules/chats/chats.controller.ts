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

@Controller("/chats")
export class ChatsController {
  constructor(private readonly chatsService: ChatsService) {}

  @UseGuards(JwtAuthGuard)
  @Get("user-chats")
  async getUserChats(@User() user: UserPayload) {
    return await this.chatsService.getUserChats(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async createChat(@User() user: UserPayload, @Body() dto: CreateChatDto) {
    return await this.chatsService.createChat(user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get(":chatId")
  async getChatById(
    @User() user: UserPayload,
    @Param("chatId") chatId: string
  ) {
    return await this.chatsService.getChatById(user.id, chatId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(":chatId")
  async updateChat(
    @User() user: UserPayload,
    @Param("chatId") chatId: string,
    @Body() dto: UpdateChatDto
  ) {
    return await this.chatsService.updateChat(user.id, chatId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(":chatId")
  async deleteChat(
    @User() user: UserPayload,
    @Param("chatId") chatId: string
  ) {
    return await this.chatsService.deleteChat(chatId, user.id);
  }

  @Post(":chatId/participants")
  async addUserToChat(
    @Param("chatId") chatId: string,
    @Body() dto: AddUserToChatDto
  ) {
    return await this.chatsService.addUserToChat(chatId, dto);
  }

  @Delete(":chatId/participants/:userId")
  async removeUserFromChat(
    @Param("chatId") chatId: string,
    @Param("userId") userId: string
  ) {
    return await this.chatsService.removeUserFromChat(userId, chatId);
  }

  @Patch(":chatId/participants/:userId/role")
  async updateParticipantRole(
    @Param("chatId") chatId: string,
    @Param("userId") userId: string,
    @Body("role") dto: UpdateParticipantRoleDto
  ) {
    const { role } = dto;
    return await this.chatsService.updateParticipantRole(userId, chatId, role);
  }

  @UseGuards(JwtAuthGuard)
  @Post("/private")
  async getOrCreatePrivateChat(
    @User() user: UserPayload,
    @Body() dto: GetOrCreateChatDto
  ) {
    return await this.chatsService.getOrCreatePrivateChat(user.id, dto.userId);
  }
}
