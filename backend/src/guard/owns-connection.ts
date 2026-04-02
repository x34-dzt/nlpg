import Elysia, { t } from "elysia";
import { Connection } from "@db/connections/connections";
import { authGuard } from "./auth";
import { ForbiddenError } from "~/lib/error";

export const ownsConnectionGuard = new Elysia({
  name: "ownsConnection",
})
  .use(authGuard)
  .guard({
    params: t.Object({
      connectionId: t.String(),
    }),
  })
  .macro("ownsConnection", {
    isAuth: true,
    async resolve({ params, user }) {
      const connection = await Connection.findByIdAndUserId(
        params.connectionId,
        user.id,
      );
      if (!connection)
        throw new ForbiddenError("Connection does not belong to you");
      return { connection };
    },
  });
