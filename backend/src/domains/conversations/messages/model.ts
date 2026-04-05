import type { Static } from "elysia";
import { t } from "elysia";
import { createSelectSchema } from "drizzle-typebox";
import { messageTable } from "@db/chat/chat.sql";

const messageSelectSchema = createSelectSchema(messageTable);

export const createMessageRequest = t.Object({
  content: t.String({ minLength: 1, maxLength: 10000 }),
  clientMessageId: t.String({ minLength: 8, maxLength: 64 }),
});

export const paginationQuerySchema = t.Object({
  cursor: t.Optional(t.String()),
  limit: t.Optional(t.Number({ minimum: 1, maximum: 100 })),
});

export const messageResponseSchema = t.Omit(messageSelectSchema, ["deletedAt"]);

export const paginatedMessageResponseSchema = t.Object({
  items: t.Array(messageResponseSchema),
  nextCursor: t.Nullable(t.String()),
  hasMore: t.Boolean(),
});

export type CreateMessageRequest = Static<typeof createMessageRequest>;
export type PaginationQuery = Static<typeof paginationQuerySchema>;
export type MessageResponse = Static<typeof messageResponseSchema>;
export type PaginatedMessageResponse = Static<
  typeof paginatedMessageResponseSchema
>;
