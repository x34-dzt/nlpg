import { pgTable, index } from "drizzle-orm/pg-core";
import type { InferSelectModel, InferInsertModel } from "drizzle-orm";
import { baseColumns } from "../base-columns";
import { userTable } from "../user/user.sql";

export const databaseConfigTable = pgTable(
  "database_configs",
  (pg) => ({
    ...baseColumns("databaseConfig"),
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
  (t) => [index("database_configs_user_id_idx").on(t.userId)],
);

export type DatabaseConfigModel = InferSelectModel<typeof databaseConfigTable>;
export type DatabaseConfigCreate = InferInsertModel<typeof databaseConfigTable>;
