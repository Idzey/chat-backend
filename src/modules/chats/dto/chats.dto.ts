import { IsDate, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class ChatsDto {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  participants: {
    userId: string;
    role: "ADMIN" | "MODERATOR" | "MEMBER";
    mutedUntil?: Date;
    lastReadMessageId?: string;
  }[];
}

export class CreateChatDto {
  @ApiPropertyOptional({ example: "General", description: "Chat name" })
  @IsString()
  @IsNotEmpty()
  name?: string;

  @ApiPropertyOptional({
    type: [String],
    example: ["userId1", "userId2"],
    description: "Initial participant IDs",
  })
  @IsOptional()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  participantIds?: string[];
}

export class UpdateChatDto {
  @ApiPropertyOptional({ example: "New Name", description: "New chat name" })
  @IsString()
  @IsOptional()
  name?: string;
}

export class MuteChatDto {
  @ApiProperty({
    example: "2026-12-31T00:00:00Z",
    description: "Mute until this date",
  })
  @IsNotEmpty()
  @IsDate()
  mutedUntil: Date;
}

export class AddUserToChatDto {
  @ApiProperty({
    example: "clxxxxxxxxxxxxx",
    description: "ID of the user to add",
  })
  @IsString()
  @IsNotEmpty()
  userId: string;
}

export class RemoveUserFromChatDto {
  @ApiProperty({
    example: "clxxxxxxxxxxxxx",
    description: "ID of the user to remove",
  })
  @IsString()
  @IsNotEmpty()
  userId: string;
}

export class UpdateParticipantRoleDto {
  @ApiProperty({
    enum: ["ADMIN", "MODERATOR", "MEMBER"],
    example: "MEMBER",
    description: "New participant role",
  })
  @IsString()
  @IsNotEmpty()
  role: "ADMIN" | "MODERATOR" | "MEMBER";
}

export class GetOrCreateChatDto {
  @ApiProperty({
    example: "clxxxxxxxxxxxxx",
    description: "Target user ID for private chat",
  })
  @IsString()
  @IsNotEmpty()
  userId: string;
}
