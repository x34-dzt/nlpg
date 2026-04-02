import { Body, Controller, Post } from "@nestjs/common";
import { RegisterUserDto } from "./dto/register-user.dto";
import { LoginUserDto } from "./dto/login-user.dto";
import { UserService } from "./user.service";

@Controller("user")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post("register")
  async register(@Body() registerDto: RegisterUserDto) {
    return this.userService.register(registerDto);
  }

  @Post("login")
  async login(@Body() loginDto: LoginUserDto) {
    return this.userService.login(loginDto);
  }
}
