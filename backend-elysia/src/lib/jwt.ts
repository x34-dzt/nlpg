import jwt from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";
import { UnauthorizedError } from "./error";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is missing");
}

class JWT {
  static signToken = (payload: JwtPayload): string => {
    return jwt.sign(payload, JWT_SECRET!, { expiresIn: "7d" });
  };

  static verifyToken = (token: string): JwtPayload => {
    try {
      return jwt.verify(token, JWT_SECRET!) as JwtPayload;
    } catch (error: unknown) {
      console.error("JWT verification failed:", error);
      throw new UnauthorizedError("Invalid or expired token");
    }
  };
}

export { JWT };
