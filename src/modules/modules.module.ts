import { Module } from "@nestjs/common";
import { PrismaModule } from "./libs/prisma/prisma.module";
import { UsersModule } from "./users/users.module";
import { ChatsModule } from "./chats/chats.module";
import { SocketModule } from "./socket/socket.module";
import { AuthModule } from "./auth/auth.module";

@Module({
  imports: [PrismaModule, UsersModule, AuthModule, ChatsModule, SocketModule],
})
export class ModulesModule {}