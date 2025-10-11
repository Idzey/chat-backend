import { Module } from '@nestjs/common';
import { ChatsModule } from '../chats/chats.module';
import { SocketGateway } from './socket.gateway';
import { SocketService } from './socket.service';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [ChatsModule, JwtModule],
  providers: [SocketGateway, SocketService],
})
export class SocketModule {}
