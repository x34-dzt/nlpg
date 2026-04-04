import { pgTable, pgEnum, index } from "drizzle-orm/pg-core";
import { baseColumns } from "../base-columns";
import { userTable } from "../user/user.sql";
import { connectionTable } from "../connections/connections.sql";

export const messageRoleEnum = pgEnum("message_role", ["user", "assistant"]);

export const conversationTable = pgTable(
  "conversations",
  (pg) => ({
    ...baseColumns("conversation"),
    title: pg.varchar({ length: 255 }),
    createdBy: pg
      .varchar({ length: 34 })
      .notNull()
      .references(() => userTable.id, { onDelete: "cascade" }),
    connectionId: pg
      .varchar({ length: 34 })
      .notNull()
      .references(() => connectionTable.id, { onDelete: "cascade" }),
    lastUsedAt: pg.timestamp({ mode: "date", withTimezone: true }),
  }),
  (t) => [
    index("conversations_created_by_idx").on(t.createdBy),
    index("conversations_connection_id_idx").on(t.connectionId),
  ],
);

export const messageTable = pgTable(
  "messages",
  (pg) => ({
    ...baseColumns("message"),
    role: messageRoleEnum().notNull().default("user"),
    content: pg.jsonb().notNull(),
    conversationId: pg
      .varchar({ length: 34 })
      .notNull()
      .references(() => conversationTable.id, { onDelete: "cascade" }),
  }),
  (t) => [index("messages_conversation_id_idx").on(t.conversationId)],
);
