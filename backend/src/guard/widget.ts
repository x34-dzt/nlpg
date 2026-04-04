import Elysia, { t } from "elysia";
import { Widget } from "@db/widgets/widgets";
import { useAuthGuard } from "./auth";
import { ForbiddenError } from "~/lib/error";

export const useWidgetGuard = new Elysia({
  name: "useWidgetGuard",
})
  .use(useAuthGuard)
  .guard({
    params: t.Object({
      connectionId: t.String(),
      widgetId: t.String(),
    }),
  })
  .macro("useWidgetGuard", {
    useAuthGuard: true,
    async resolve({ params, user }) {
      const widget = await Widget.findByIdAndUserId(
        params.widgetId,
        user.id,
      );
      if (!widget)
        throw new ForbiddenError("Widget does not belong to you");
      return { widget };
    },
  });
