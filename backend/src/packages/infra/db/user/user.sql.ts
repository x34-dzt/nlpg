import { pgTable } from "drizzle-orm/pg-core";
import type { InferSelectModel, InferInsertModel } from "drizzle-orm";
import { baseColumns } from "../base-columns";

export const userTable = pgTable("users", (pg) => ({
  ...baseColumns("user"),
  username: pg.varchar({ length: 50 }).notNull().unique(),
  password: pg.varchar({ length: 255 }).notNull(),
}));

export type UserModel = InferSelectModel<typeof userTable>;
export type UserCreate = InferInsertModel<typeof userTable>;
