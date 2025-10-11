import { IsNotEmpty, IsString } from "class-validator";

export class CompleteUserDto {
    @IsString()
    @IsNotEmpty()
    firstName: string;

    @IsString()
    @IsNotEmpty()
    lastName: string;
}