import { t } from "elysia";
import {
  widgetResponseSchema,
  executeAllResponseSchema,
} from "../widgets/model";

export const publicDashboardResponseSchema = t.Object({
  connection: t.Object({
    displayName: t.String(),
  }),
  widgets: t.Array(widgetResponseSchema),
  results: executeAllResponseSchema,
});

export const publicDashboardParams = t.Object({
  shareToken: t.String(),
});
