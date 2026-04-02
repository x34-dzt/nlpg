import { db, eq } from "@db";
import { userTable } from "./user.sql";
import type { InferSelectModel, InferInsertModel } from "drizzle-orm";

export type UserModel = InferSelectModel<typeof userTable>;
export type UserCreate = InferInsertModel<typeof userTable>;

export class User {
  static Schema = userTable;

  static async create(data: UserCreate): Promise<UserModel | null> {
    const [user] = await db.insert(userTable).values(data).returning();
    return user ?? null;
  }

  static async findByUsername(
    username: string,
  ): Promise<UserModel | null> {
    const [user] = await db
      .select()
      .from(userTable)
      .where(eq(userTable.username, username));
    return user ?? null;
  }

  static async findById(id: string): Promise<UserModel | null> {
    const [user] = await db
      .select()
      .from(userTable)
      .where(eq(userTable.id, id));
    return user ?? null;
  }
}
