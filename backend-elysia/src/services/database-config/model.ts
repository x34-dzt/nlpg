import type { Static } from "elysia";
import { t } from "elysia";
import { createSelectSchema } from "drizzle-typebox";
import { databaseConfigTable } from "@db/database-config";

export const createDatabaseConfigSchema = t.Object({
  displayName: t.String({ minLength: 1, maxLength: 100 }),
  host: t.String({ minLength: 1, maxLength: 255 }),
  port: t.Optional(t.Number({ minimum: 1, maximum: 65535 })),
  database: t.String({ minLength: 1, maxLength: 100 }),
  username: t.String({ minLength: 1, maxLength: 100 }),
  password: t.String({ minLength: 1, maxLength: 255 }),
  ssl: t.Optional(t.Boolean()),
});

const databaseConfigSelectSchema = createSelectSchema(databaseConfigTable);

export const databaseConfigResponseSchema = t.Omit(databaseConfigSelectSchema, [
  "password",
  "deletedAt",
]);

export const paginationQuerySchema = t.Object({
  cursor: t.Optional(t.String()),
  limit: t.Optional(t.Number({ minimum: 1, maximum: 100 })),
});

export const paginatedDatabaseConfigResponseSchema = t.Object({
  items: t.Array(databaseConfigResponseSchema),
  nextCursor: t.Nullable(t.String()),
  hasMore: t.Boolean(),
});

export type CreateDatabaseConfigSchema = Static<
  typeof createDatabaseConfigSchema
>;
export type DatabaseConfigResponse = Static<
  typeof databaseConfigResponseSchema
>;
export type PaginationQuery = Static<typeof paginationQuerySchema>;
export type PaginatedDatabaseConfigResponse = Static<
  typeof paginatedDatabaseConfigResponseSchema
>;
