import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  @Length(8, 20)
  password: string;

  @IsString()
  @IsNotEmpty()
  @Length(2, 50)
  name: string;
}
