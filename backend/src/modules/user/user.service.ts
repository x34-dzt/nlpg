import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { UserRepo } from "./user.repo";
import { AuthService } from "../auth/auth.service";
import { RegisterUserDto } from "./dto/register-user.dto";
import { LoginUserDto } from "./dto/login-user.dto";

@Injectable()
export class UserService {
  constructor(
    private readonly userRepo: UserRepo,
    private readonly authService: AuthService,
  ) {}

  async register(registerUserDto: RegisterUserDto) {
    const existing = await this.userRepo.findByUsername(
      registerUserDto.username,
    );
    if (existing) {
      throw new ConflictException("Username already exists");
    }

    const hashedPassword = await bcrypt.hash(registerUserDto.password, 10);

    const user = await this.userRepo.create({
      username: registerUserDto.username,
      password: hashedPassword,
    });

    const token = this.authService.generateToken({
      sub: user.id,
      username: user.username,
    });

    return { user: { id: user.id, username: user.username }, token };
  }

  async login(loginUserDto: LoginUserDto) {
    const user = await this.userRepo.findByUsername(loginUserDto.username);
    if (!user) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const isPasswordValid = await bcrypt.compare(
      loginUserDto.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const token = this.authService.generateToken({
      sub: user.id,
      username: user.username,
    });

    return { user: { id: user.id, username: user.username }, token };
  }
}
