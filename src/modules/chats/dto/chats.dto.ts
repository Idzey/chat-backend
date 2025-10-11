import { IsDate, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class ChatsDto {
    id: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
    participants: {
        userId: string;
        role: 'ADMIN' | 'MODERATOR' | 'MEMBER';
        mutedUntil?: Date;
        lastReadMessageId?: string;
    }[];
}

export class CreateChatDto {
    @IsString()
    @IsNotEmpty()
    name?: string;

    @IsOptional()
    @IsString({ each: true })
    @IsNotEmpty({ each: true })
    
    participantIds?: string[];
}

export class UpdateChatDto {
    @IsString()
    @IsOptional()

    name?: string;
}

export class MuteChatDto {
    @IsNotEmpty()
    @IsDate()

    mutedUntil: Date;
}

export class AddUserToChatDto {
    @IsString()
    @IsNotEmpty()

    userId: string;
}

export class RemoveUserFromChatDto {
    @IsString()
    @IsNotEmpty()

    userId: string;
}

export class UpdateParticipantRoleDto {
    @IsString()
    @IsNotEmpty()
    role: 'ADMIN' | 'MODERATOR' | 'MEMBER';
}

export class GetOrCreateChatDto {
    @IsString()
    @IsNotEmpty()

    userId: string;
}