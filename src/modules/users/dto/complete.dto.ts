import { IsNotEmpty, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CompleteUserDto {
  @ApiProperty({ example: "John", description: "First name" })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: "Doe", description: "Last name" })
  @IsString()
  @IsNotEmpty()
  lastName: string;
}
