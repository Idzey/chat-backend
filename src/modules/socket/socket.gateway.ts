import {
  ConnectedSocket,
  MessageBody,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { Server } from "socket.io";
import { CreateMessageDto } from "./dto/create-message.dto";
import { AuthenticatedSocket } from "interfaces/socket";
import { UseGuards } from "@nestjs/common";
import { SocketService } from "./socket.service";
import { WsJwtGuard } from "src/common/guards/jwt-socket.guard";
import { AsyncApiSub, AsyncApiPub } from "nestjs-asyncapi";

@UseGuards(WsJwtGuard)
@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL
      ? process.env.FRONTEND_URL.split(",")
      : "*",
    credentials: true,
  },
})
export class SocketGateway implements OnGatewayDisconnect {
  constructor(private readonly socketService: SocketService) {}

  @WebSocketServer()
  private io: Server;

  afterInit(server: Server) {
    this.io = server;
  }

  async handleDisconnect(client: AuthenticatedSocket) {
    const userId = client.data?.user?.id;
    if (userId) {
      const user = await this.socketService.setUserOffline(userId);
      this.io.emit("user:offline", { userId, lastSeen: user.lastSeen });
    }
  }

  @AsyncApiSub({
    channel: "join_user",
    summary: "Join personal notification room for the authenticated user",
    message: { name: "join_user", payload: Object },
  })
  @UseGuards(WsJwtGuard)
  @SubscribeMessage("join_user")
  async joinUser(@ConnectedSocket() client: AuthenticatedSocket) {
    const userId = client.data.user.id;
    this.socketService.connectUser(userId, client);
    const user = await this.socketService.setUserOnline(userId);
    this.io.emit("user:online", { userId, lastSeen: user.lastSeen });
  }

  @AsyncApiSub({
    channel: "join_chat",
    summary: "Join a chat room to receive its messages in real-time",
    message: {
      name: "join_chat",
      payload: Object,
    },
  })
  @UseGuards(WsJwtGuard)
  @SubscribeMessage("join_chat")
  joinChat(
    @MessageBody() data: { chatId: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    console.log("Joining chat:", data.chatId);
    this.socketService.joinChat(data.chatId, client);
  }

  @AsyncApiSub({
    channel: "leave_chat",
    summary: "Leave a chat room",
    message: {
      name: "leave_chat",
      payload: Object,
    },
  })
  @UseGuards(WsJwtGuard)
  @SubscribeMessage("leave_chat")
  leaveChat(
    @MessageBody() data: { chatId: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    this.socketService.leaveChat(data.chatId, client);
  }

  @AsyncApiSub({
    channel: "message:send",
    summary: "Send a message to a chat room",
    message: { name: "CreateMessageDto", payload: CreateMessageDto },
  })
  @AsyncApiPub({
    channel: "message:new",
    summary: "Receive a new message broadcast to a chat room",
    message: { name: "NewMessageEvent", payload: CreateMessageDto },
  })
  @UseGuards(WsJwtGuard)
  @SubscribeMessage("message:send")
  async sendMessage(
    @MessageBody() data: CreateMessageDto,
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    const message = await this.socketService.sendMessage(
      client.data.user.id,
      data,
    );

    this.io.to(`chat:${data.chatId}`).emit("message:new", message);

    return message;
  }

  @AsyncApiPub({
    channel: "notification",
    summary: "Receive a notification for a new message (pushed to user room)",
    message: { name: "NotificationEvent", payload: CreateMessageDto },
  })
  onNotification() {
    // Emitted by SocketService.sendMessageNotification
  }

  @AsyncApiSub({
    channel: "message:edit",
    summary: "Edit an existing message",
    message: {
      name: "EditMessageEvent",
      payload: Object,
    },
  })
  @AsyncApiPub({
    channel: "message:edited",
    summary: "Broadcast an edited message to a chat room",
    message: { name: "EditedMessageEvent", payload: Object },
  })
  @UseGuards(WsJwtGuard)
  @SubscribeMessage("message:edit")
  async editMessage(
    @MessageBody() data: { chatId: string; messageId: string; content: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    const updated = await this.socketService.editMessage(
      client.data.user.id,
      data,
    );
    this.io.to(`chat:${data.chatId}`).emit("message:edited", updated);
    return updated;
  }

  @AsyncApiSub({
    channel: "message:delete",
    summary: "Delete a message",
    message: { name: "DeleteMessageEvent", payload: Object },
  })
  @AsyncApiPub({
    channel: "message:deleted",
    summary: "Broadcast a deleted message event to a chat room",
    message: { name: "DeletedMessageEvent", payload: Object },
  })
  @UseGuards(WsJwtGuard)
  @SubscribeMessage("message:delete")
  async deleteMessage(
    @MessageBody() data: { chatId: string; messageId: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    await this.socketService.deleteMessage(client.data.user.id, data);
    this.io.to(`chat:${data.chatId}`).emit("message:deleted", {
      messageId: data.messageId,
      chatId: data.chatId,
    });
    return { success: true };
  }

  @AsyncApiSub({
    channel: "message:read",
    summary: "Mark a message as read",
    message: { name: "ReadMessageEvent", payload: Object },
  })
  @AsyncApiPub({
    channel: "message:read",
    summary: "Broadcast read status to a chat room",
    message: { name: "ReadStatusEvent", payload: Object },
  })
  @UseGuards(WsJwtGuard)
  @SubscribeMessage("message:read")
  async markRead(
    @MessageBody() data: { chatId: string; messageId: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    const result = await this.socketService.markMessageRead(
      client.data.user.id,
      data,
    );
    this.io.to(`chat:${data.chatId}`).emit("message:read", {
      messageId: data.messageId,
      chatId: data.chatId,
      userId: client.data.user.id,
    });
    return result;
  }

  @AsyncApiSub({
    channel: "message:typing",
    summary: "Notify chat members that a user is typing",
    message: { name: "TypingEvent", payload: Object },
  })
  @UseGuards(WsJwtGuard)
  @SubscribeMessage("message:typing")
  typing(
    @MessageBody() data: { chatId: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    client.to(`chat:${data.chatId}`).emit("message:typing", {
      chatId: data.chatId,
      userId: client.data.user.id,
    });
  }

  @AsyncApiSub({
    channel: "message:stop_typing",
    summary: "Notify chat members that a user stopped typing",
    message: { name: "StopTypingEvent", payload: Object },
  })
  @UseGuards(WsJwtGuard)
  @SubscribeMessage("message:stop_typing")
  stopTyping(
    @MessageBody() data: { chatId: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    client.to(`chat:${data.chatId}`).emit("message:stop_typing", {
      chatId: data.chatId,
      userId: client.data.user.id,
    });
  }
}
