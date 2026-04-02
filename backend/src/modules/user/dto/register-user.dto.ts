import { IsString, MinLength, MaxLength } from "class-validator";

export class RegisterUserDto {
  @IsString()
  @MinLength(3)
  @MaxLength(30)
  username: string;

  @IsString()
  @MinLength(6)
  @MaxLength(100)
  password: string;
}
