import Elysia, { t } from "elysia";
import { Connection } from "@db/connections/connections";
import { useAuthGuard } from "./auth";
import { ForbiddenError } from "~/lib/error";

export const useConnectionGuard = new Elysia({
  name: "useConnectionGuard",
})
  .use(useAuthGuard)
  .guard({
    params: t.Object({
      connectionId: t.String(),
    }),
  })
  .macro("useConnectionGuard", {
    useAuthGuard: true,
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
