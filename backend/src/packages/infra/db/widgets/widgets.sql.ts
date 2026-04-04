import { pgTable, index, jsonb } from "drizzle-orm/pg-core";
import { varchar, text, timestamp } from "drizzle-orm/pg-core";
import { baseColumns } from "../base-columns";
import { userTable } from "../user/user.sql";
import { connectionTable } from "../connections/connections.sql";

export const widgetsTable = pgTable(
  "widgets",
  (pg) => ({
    ...baseColumns("widget"),
    userId: pg
      .varchar({ length: 34 })
      .notNull()
      .references(() => userTable.id, { onDelete: "cascade" }),
    connectionId: pg
      .varchar({ length: 34 })
      .notNull()
      .references(() => connectionTable.id, { onDelete: "cascade" }),
    title: varchar({ length: 200 }).notNull(),
    sqlQuery: text("sql_query").notNull(),
    chartType: varchar({ length: 20 }).notNull(),
    layout: jsonb()
      .notNull()
      .$type<{ x: number; y: number; w: number; h: number }>(),
  }),
  (t) => [
    index("widgets_connection_id_idx").on(t.connectionId),
    index("widgets_user_id_idx").on(t.userId),
  ],
);
