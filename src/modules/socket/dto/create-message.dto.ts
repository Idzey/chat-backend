import { MessageType } from "@prisma/client";
import { IsNotEmpty, IsString } from "class-validator";

export class CreateMessageDto {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsString()
  @IsNotEmpty()
  chatId: string;

  @IsString()
  @IsNotEmpty()
  type: MessageType;
}