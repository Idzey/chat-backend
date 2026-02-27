import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
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
    origin: process.env.FRONTEND_URL,
    credentials: true,
  },
})
export class SocketGateway {
  constructor(private readonly socketService: SocketService) {}

  private io: Server;

  afterInit(server: Server) {
    this.io = server;
  }

  @AsyncApiSub({
    channel: "join_user",
    summary: "Join personal notification room for the authenticated user",
    message: { name: "join_user", payload: Object },
  })
  @UseGuards(WsJwtGuard)
  @SubscribeMessage("join_user")
  joinUser(@ConnectedSocket() client: AuthenticatedSocket) {
    this.socketService.connectUser(client.data.user.id, client);
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
}
