import { pgTable } from "drizzle-orm/pg-core";
import { createId } from "./id";
import { InferSelectModel, InferInsertModel } from "drizzle-orm";
import { userTable } from "./user.sql";
import { pgEnum, index } from "drizzle-orm/pg-core";

export const conversationTable = pgTable(
  "conversations",
  (pg) => ({
    id: pg
      .varchar({ length: 34 })
      .primaryKey()
      .$defaultFn(() => createId("conn")),
    createdBy: pg
      .varchar({ length: 34 })
      .notNull()
      .references(() => userTable.id, { onDelete: "cascade" }),
    lastUsedAt: pg.timestamp({ mode: "date", withTimezone: true }),
    createdAt: pg
      .timestamp({ mode: "date", withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: pg
      .timestamp({ mode: "date", withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdateFn(() => new Date()),
    deletedAt: pg.timestamp({ mode: "date", withTimezone: true }),
  }),
  (t) => [index("conversations_created_by_idx").on(t.createdBy)],
);

export type ConversationModel = InferSelectModel<typeof conversationTable>;
export type InsertConversationModel = InferInsertModel<
  typeof conversationTable
>;

enum MessageRole {
  user = "user",
  assistant = "assistant",
}

export const messageRoleEnum = pgEnum("message_role", [
  MessageRole.user,
  MessageRole.assistant,
]);

export const messageTable = pgTable(
  "messages",
  (pg) => ({
    id: pg
      .varchar({ length: 34 })
      .primaryKey()
      .$defaultFn(() => createId("message")),
    role: messageRoleEnum().notNull().default(MessageRole.user),
    content: pg.jsonb().notNull(),
    conversationId: pg
      .varchar({ length: 34 })
      .references(() => conversationTable.id, { onDelete: "cascade" })
      .notNull(),
    createdAt: pg
      .timestamp({ mode: "date", withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: pg
      .timestamp({ mode: "date", withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdateFn(() => new Date()),
    deletedAt: pg.timestamp({ mode: "date", withTimezone: true }),
  }),
  (t) => [index("messages_conversation_id_idx").on(t.conversationId)],
);

export type MessageModel = InferSelectModel<typeof messageTable>;
export type InsertMessageModel = InferInsertModel<typeof messageTable>;
