import type { Static } from "elysia";
import { t } from "elysia";
import { createSelectSchema } from "drizzle-typebox";
import { widgetsTable } from "@db/widgets/widgets.sql";

const chartTypeUnion = t.Union([
  t.Literal("bar"),
  t.Literal("line"),
  t.Literal("pie"),
  t.Literal("area"),
  t.Literal("scatter"),
  t.Literal("table"),
]);

export const layoutSchema = t.Object({
  x: t.Number(),
  y: t.Number(),
  w: t.Number(),
  h: t.Number(),
});

export const createWidgetSchema = t.Object({
  title: t.String({ minLength: 1, maxLength: 200 }),
  sqlQuery: t.String({ minLength: 1 }),
  chartType: chartTypeUnion,
  layout: t.Optional(layoutSchema),
});

export const updateWidgetSchema = t.Object({
  title: t.Optional(t.String({ minLength: 1, maxLength: 200 })),
  chartType: t.Optional(chartTypeUnion),
  layout: t.Optional(layoutSchema),
});

export const updateLayoutsSchema = t.Object({
  widgets: t.Array(
    t.Object({
      id: t.String(),
      layout: layoutSchema,
    }),
  ),
});

const widgetSelectSchema = createSelectSchema(widgetsTable);

export const widgetResponseSchema = t.Omit(widgetSelectSchema, ["deletedAt"]);

export const widgetListResponseSchema = t.Array(widgetResponseSchema);

export const executeResultSchema = t.Object({
  rows: t.Array(t.Record(t.String(), t.Any())),
  fields: t.Array(t.Object({ name: t.String(), dataTypeID: t.Number() })),
  rowCount: t.Number(),
  truncated: t.Boolean(),
  durationMs: t.Number(),
  error: t.Optional(t.Boolean()),
  message: t.Optional(t.String()),
});

export const executeAllResponseSchema = t.Array(
  t.Object({
    widgetId: t.String(),
    result: executeResultSchema,
  }),
);

export type CreateWidgetInput = Static<typeof createWidgetSchema>;
export type UpdateWidgetInput = Static<typeof updateWidgetSchema>;
export type UpdateLayoutsInput = Static<typeof updateLayoutsSchema>;
export type WidgetResponse = Static<typeof widgetResponseSchema>;
