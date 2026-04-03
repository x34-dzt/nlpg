import bearer from "@elysiajs/bearer";
import Elysia from "elysia";
import { JWT } from "~/lib/jwt";
import type { UserModel } from "@db/user/user";
import { UnauthorizedError } from "~/lib/error";
import { db, eq } from "@db";
import { userTable } from "@db/user/user.sql";

export const useAuthGuard = new Elysia({ name: "useAuthGuard" })
  .use(bearer())
  .macro("useAuthGuard", {
    async resolve({ bearer }): Promise<{ user: UserModel }> {
      if (!bearer) throw new UnauthorizedError("Missing auth token");

      const claims = JWT.verifyToken(bearer);
      if (!claims.sub) throw new UnauthorizedError();

      const [user] = await db
        .select()
        .from(userTable)
        .where(eq(userTable.id, claims.sub));

      if (!user) throw new UnauthorizedError();

      return { user };
    },
  });
