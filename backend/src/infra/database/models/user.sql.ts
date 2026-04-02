import { timestamp } from "drizzle-orm/pg-core";
import { varchar } from "drizzle-orm/pg-core";
import { pgTable } from "drizzle-orm/pg-core";
import { createId } from "./id";
import { InferSelectModel, InferInsertModel } from "drizzle-orm";

export const userTable = pgTable("users", (pg) => ({
  id: varchar({ length: 34 })
    .primaryKey()
    .$defaultFn(() => createId("user")),
  username: pg.varchar({ length: 50 }).notNull().unique(),
  password: pg.varchar({ length: 255 }).notNull(),
  createdAt: timestamp({ mode: "date", withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp({ mode: "date", withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdateFn(() => new Date()),
  deletedAt: timestamp({ mode: "date", withTimezone: true }),
}));

export type UserModel = InferSelectModel<typeof userTable>;
export type InsertUserModel = InferInsertModel<typeof userTable>;
