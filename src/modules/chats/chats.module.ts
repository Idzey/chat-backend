import { Module } from "@nestjs/common";
import { MessagesController } from "./messages/messages.controller";
import { MessagesService } from "./messages/messages.service";
import { ChatsController } from "./chats.controller";
import { ChatsService } from "./chats.service";

@Module({
    controllers: [MessagesController, ChatsController],
    providers: [MessagesService, ChatsService],
    exports: [MessagesService, ChatsService],
})

export class ChatsModule {}