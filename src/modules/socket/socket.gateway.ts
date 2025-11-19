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

  @UseGuards(WsJwtGuard)
  @SubscribeMessage("join_user")
  joinUser(@ConnectedSocket() client: AuthenticatedSocket) {
    this.socketService.connectUser(client.data.user.id, client);
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage("join_chat")
  joinChat(
    @MessageBody() data: { chatId: string },
    @ConnectedSocket() client: AuthenticatedSocket
  ) {
    console.log('Joining chat:', data.chatId);
    this.socketService.joinChat(data.chatId, client);
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage("leave_chat")
  leaveChat(
    @MessageBody() data: { chatId: string },
    @ConnectedSocket() client: AuthenticatedSocket
  ) {
    this.socketService.leaveChat(data.chatId, client);
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage("message:send")
  async sendMessage(
    @MessageBody() data: CreateMessageDto,
    @ConnectedSocket() client: AuthenticatedSocket
  ) {
    const message = await this.socketService.sendMessage(
      client.data.user.id,
      data
    );

    this.io.to(`chat:${data.chatId}`).emit("message:new", message);

    return message;
  }
}
