import type { Static } from "elysia";
import { t } from "elysia";
import { createSelectSchema } from "drizzle-typebox";
import { conversationTable, messageTable } from "@db/chat";

const conversationSelectSchema = createSelectSchema(conversationTable);
const messageSelectSchema = createSelectSchema(messageTable);

export const createConversationSchema = t.Object({
  databaseConfigId: t.String(),
});

export const conversationResponseSchema = t.Omit(conversationSelectSchema, [
  "deletedAt",
]);

export const messageResponseSchema = t.Omit(messageSelectSchema, ["deletedAt"]);

export const paginationQuerySchema = t.Object({
  cursor: t.Optional(t.String()),
  limit: t.Optional(t.Number({ minimum: 1, maximum: 100 })),
});

export const paginatedMessageResponseSchema = t.Object({
  items: t.Array(messageResponseSchema),
  nextCursor: t.Nullable(t.String()),
  hasMore: t.Boolean(),
});

export type CreateConversationSchema = Static<typeof createConversationSchema>;
export type ConversationResponse = Static<typeof conversationResponseSchema>;
export type MessageResponse = Static<typeof messageResponseSchema>;
export type PaginationQuery = Static<typeof paginationQuerySchema>;
export type PaginatedMessageResponse = Static<
  typeof paginatedMessageResponseSchema
>;
