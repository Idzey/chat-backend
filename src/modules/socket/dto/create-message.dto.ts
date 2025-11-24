import { MessageType } from "@prisma/client";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";

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

  @IsString()
  @IsOptional()
  fileId?: string;
}