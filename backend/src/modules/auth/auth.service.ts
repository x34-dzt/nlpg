import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  generateToken(payload: { sub: string; username: string }): string {
    return this.jwtService.sign(payload);
  }

  verifyToken(token: string): { sub: string; username: string } {
    return this.jwtService.verify(token);
  }
}
