import { MessageType } from "@prisma/client";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateMessageDto {
  @ApiProperty({ example: "Hello, world!", description: "Message content" })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({
    example: "clxxxxxxxxxxxxx",
    description: "Chat ID to send message to",
  })
  @IsString()
  @IsNotEmpty()
  chatId: string;

  @ApiProperty({
    enum: ["TEXT", "IMAGE", "FILE", "VOICE", "VIDEO"],
    example: "TEXT",
    description: "Message type",
  })
  @IsString()
  @IsNotEmpty()
  type: MessageType;

  @ApiPropertyOptional({
    example: "clxxxxxxxxxxxxx",
    description: "Attached file ID (optional)",
  })
  @IsString()
  @IsOptional()
  fileId?: string;
}
