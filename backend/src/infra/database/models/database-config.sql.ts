import { timestamp, varchar, pgTable, index } from "drizzle-orm/pg-core";
import { createId } from "./id";
import { InferSelectModel, InferInsertModel } from "drizzle-orm";
import { userTable } from "./user.sql";

export const databaseConfigTable = pgTable(
  "database_configs",
  (pg) => ({
    id: varchar({ length: 34 })
      .primaryKey()
      .$defaultFn(() => createId("dbcfg")),

    userId: varchar({ length: 34 })
      .notNull()
      .references(() => userTable.id, { onDelete: "cascade" }),

    displayName: pg.varchar({ length: 100 }).notNull(),

    host: pg.varchar({ length: 255 }).notNull(),
    port: pg.integer().notNull().default(5432),
    database: pg.varchar({ length: 100 }).notNull(),
    username: pg.varchar({ length: 100 }).notNull(),
    password: pg.varchar({ length: 255 }).notNull(),
    ssl: pg.boolean().notNull().default(false),

    lastUsedAt: timestamp({ mode: "date", withTimezone: true }),
    createdAt: timestamp({ mode: "date", withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp({ mode: "date", withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdateFn(() => new Date()),
    deletedAt: timestamp({ mode: "date", withTimezone: true }),
  }),
  (t) => [index("database_configs_user_id_idx").on(t.userId)],
);

export type DatabaseConfigModel = InferSelectModel<typeof databaseConfigTable>;
export type InsertDatabaseConfigModel = InferInsertModel<
  typeof databaseConfigTable
>;
