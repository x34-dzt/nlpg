import { pgTable, index } from "drizzle-orm/pg-core";
import { baseColumns } from "../base-columns";
import { userTable } from "../user/user.sql";

export const connectionTable = pgTable(
  "connections",
  (pg) => ({
    ...baseColumns("connection"),
    userId: pg
      .varchar({ length: 34 })
      .notNull()
      .references(() => userTable.id, { onDelete: "cascade" }),
    displayName: pg.varchar({ length: 100 }).notNull(),
    host: pg.varchar({ length: 255 }).notNull(),
    port: pg.integer().notNull().default(5432),
    database: pg.varchar({ length: 100 }).notNull(),
    username: pg.varchar({ length: 100 }).notNull(),
    password: pg.varchar({ length: 255 }).notNull(),
    ssl: pg.boolean().notNull().default(false),
    lastUsedAt: pg.timestamp({ mode: "date", withTimezone: true }),
  }),
  (t) => [index("connections_user_id_idx").on(t.userId)],
);


