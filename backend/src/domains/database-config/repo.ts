import { db, eq, lt, desc, and, isNull } from "@db";
import {
  databaseConfigTable,
  type DatabaseConfigModel,
  type DatabaseConfigCreate,
} from "@db/database-config";

export class DatabaseConfigRepo {
  static async create(
    data: DatabaseConfigCreate,
  ): Promise<DatabaseConfigModel | null> {
    const [config] = await db
      .insert(databaseConfigTable)
      .values(data)
      .returning();
    return config ?? null;
  }

  static async findManyByUserId(
    userId: string,
    cursor: string | undefined,
    limit: number,
  ): Promise<DatabaseConfigModel[]> {
    const conditions = [
      eq(databaseConfigTable.userId, userId),
      isNull(databaseConfigTable.deletedAt),
    ];

    if (cursor) {
      conditions.push(lt(databaseConfigTable.id, cursor));
    }

    return db
      .select()
      .from(databaseConfigTable)
      .where(and(...conditions))
      .orderBy(desc(databaseConfigTable.id))
      .limit(limit + 1);
  }

  static async findById(id: string): Promise<DatabaseConfigModel | null> {
    const [config] = await db
      .select()
      .from(databaseConfigTable)
      .where(eq(databaseConfigTable.id, id));
    return config ?? null;
  }
}
