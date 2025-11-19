import { Module } from '@nestjs/common';
import { ChatsModule } from '../chats/chats.module';
import { SocketGateway } from './socket.gateway';
import { SocketService } from './socket.service';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [ChatsModule, JwtModule, UsersModule],
  providers: [SocketGateway, SocketService],
})
export class SocketModule {}
