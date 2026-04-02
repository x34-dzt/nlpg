import { IsString, MinLength, MaxLength } from "class-validator";

export class LoginUserDto {
  @IsString()
  @MinLength(3)
  @MaxLength(30)
  username: string;

  @IsString()
  @MinLength(6)
  @MaxLength(100)
  password: string;
}
