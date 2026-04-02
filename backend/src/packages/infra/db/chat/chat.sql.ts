import { pgTable, pgEnum, index } from "drizzle-orm/pg-core";
import type { InferSelectModel, InferInsertModel } from "drizzle-orm";
import { baseColumns } from "../base-columns";
import { userTable } from "../user/user.sql";
import { databaseConfigTable } from "../database-config/database-config.sql";
import type { AiSdkMessage } from "./message.types";

export const messageRoleEnum = pgEnum("message_role", ["user", "assistant"]);

export const conversationTable = pgTable(
  "conversations",
  (pg) => ({
    ...baseColumns("conversation"),
    createdBy: pg
      .varchar({ length: 34 })
      .notNull()
      .references(() => userTable.id, { onDelete: "cascade" }),
    databaseConfigId: pg
      .varchar({ length: 34 })
      .notNull()
      .references(() => databaseConfigTable.id, { onDelete: "cascade" }),
    lastUsedAt: pg.timestamp({ mode: "date", withTimezone: true }),
  }),
  (t) => [
    index("conversations_created_by_idx").on(t.createdBy),
    index("conversations_database_config_id_idx").on(t.databaseConfigId),
  ],
);

export const messageTable = pgTable(
  "messages",
  (pg) => ({
    ...baseColumns("message"),
    role: messageRoleEnum().notNull().default("user"),
    content: pg.jsonb().$type<AiSdkMessage>().notNull(),
    conversationId: pg
      .varchar({ length: 34 })
      .notNull()
      .references(() => conversationTable.id, { onDelete: "cascade" }),
  }),
  (t) => [index("messages_conversation_id_idx").on(t.conversationId)],
);

export type ConversationModel = InferSelectModel<typeof conversationTable>;
export type ConversationCreate = InferInsertModel<typeof conversationTable>;
export type MessageModel = InferSelectModel<typeof messageTable>;
export type MessageCreate = InferInsertModel<typeof messageTable>;
