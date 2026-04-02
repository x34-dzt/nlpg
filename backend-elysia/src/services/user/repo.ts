import { db, eq } from "@db";
import { userTable, type UserModel, type UserCreate } from "@db/user";

export class UserRepo {
  static async create(data: UserCreate): Promise<UserModel | null> {
    const [user] = await db.insert(userTable).values(data).returning();
    return user ?? null;
  }

  static async findByUsername(username: string): Promise<UserModel | null> {
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
