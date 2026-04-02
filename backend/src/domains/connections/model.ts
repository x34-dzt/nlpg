import type { Static } from "elysia";
import { t } from "elysia";
import { createSelectSchema } from "drizzle-typebox";
import { connectionTable } from "@db/connections/connections.sql";

export const createConnectionSchema = t.Object({
  displayName: t.String({ minLength: 1, maxLength: 100 }),
  host: t.String({ minLength: 1, maxLength: 255 }),
  port: t.Optional(t.Number({ minimum: 1, maximum: 65535 })),
  database: t.String({ minLength: 1, maxLength: 100 }),
  username: t.String({ minLength: 1, maxLength: 100 }),
  password: t.String({ minLength: 1, maxLength: 255 }),
  ssl: t.Optional(t.Boolean()),
});

const connectionSelectSchema = createSelectSchema(connectionTable);

export const connectionResponseSchema = t.Omit(connectionSelectSchema, [
  "password",
  "deletedAt",
]);

export const paginationQuerySchema = t.Object({
  cursor: t.Optional(t.String()),
  limit: t.Optional(t.Number({ minimum: 1, maximum: 100 })),
});

export const paginatedConnectionResponseSchema = t.Object({
  items: t.Array(connectionResponseSchema),
  nextCursor: t.Nullable(t.String()),
  hasMore: t.Boolean(),
});

export type CreateConnectionSchema = Static<typeof createConnectionSchema>;
export type ConnectionResponse = Static<typeof connectionResponseSchema>;
export type PaginationQuery = Static<typeof paginationQuerySchema>;
export type PaginatedConnectionResponse = Static<
  typeof paginatedConnectionResponseSchema
>;
