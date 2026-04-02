import type { Static } from "elysia";
import { t } from "elysia";
import { createSelectSchema } from "drizzle-typebox";
import { conversationTable } from "@db/chat/chat.sql";

const conversationSelectSchema = createSelectSchema(conversationTable);

export const connectionParams = t.Object({
  connectionId: t.String(),
});

export const conversationResponseSchema = t.Omit(conversationSelectSchema, [
  "deletedAt",
]);

export const paginationQuerySchema = t.Object({
  cursor: t.Optional(t.String()),
  limit: t.Optional(t.Number({ minimum: 1, maximum: 100 })),
});

export const paginatedConversationResponseSchema = t.Object({
  items: t.Array(conversationResponseSchema),
  nextCursor: t.Nullable(t.String()),
  hasMore: t.Boolean(),
});

export type ConversationResponse = Static<typeof conversationResponseSchema>;
export type PaginationQuery = Static<typeof paginationQuerySchema>;
export type PaginatedConversationResponse = Static<
  typeof paginatedConversationResponseSchema
>;
