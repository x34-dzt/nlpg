import { JWT } from "~/lib/jwt";
import { User } from "@db/user/user";
import { ConflictError, NotFoundError, UnauthorizedError } from "~/lib/error";
import type { AuthResponse } from "./model";

class UserService {
  static async register(body: {
    username: string;
    password: string;
  }): Promise<AuthResponse> {
    const existing = await User.findByUsername(body.username);
    if (existing) {
      throw new ConflictError("Username already exists");
    }

    const hashedPassword = await Bun.password.hash(body.password);

    const user = await User.create({
      username: body.username,
      password: hashedPassword,
    });

    if (!user) {
      throw new ConflictError("Failed to create user");
    }

    const token = JWT.signToken({ sub: user.id });

    return {
      user: { id: user.id, username: user.username },
      token,
    };
  }

  static async login(body: {
    username: string;
    password: string;
  }): Promise<AuthResponse> {
    const user = await User.findByUsername(body.username);
    if (!user) {
      throw new NotFoundError("user not found");
    }

    const hashToVerify = user.password;
    const isValid = await Bun.password.verify(body.password, hashToVerify);

    if (!user || !isValid) {
      throw new UnauthorizedError("Invalid credentials");
    }

    const token = JWT.signToken({ sub: user.id });

    return {
      user: { id: user.id, username: user.username },
      token,
    };
  }
}

export { UserService };
