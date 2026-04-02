import { db, eq, lt, desc, and, isNull } from "@db";
import { connectionTable } from "./connections.sql";
import type { InferSelectModel, InferInsertModel } from "drizzle-orm";

export type ConnectionModel = InferSelectModel<typeof connectionTable>;
export type ConnectionCreate = InferInsertModel<typeof connectionTable>;

export class Connection {
  static Schema = connectionTable;

  static async create(
    data: ConnectionCreate,
  ): Promise<ConnectionModel | null> {
    const [connection] = await db
      .insert(connectionTable)
      .values(data)
      .returning();
    return connection ?? null;
  }

  static async findManyByUserId(
    userId: string,
    cursor: string | undefined,
    limit: number,
  ): Promise<ConnectionModel[]> {
    const conditions = [
      eq(connectionTable.userId, userId),
      isNull(connectionTable.deletedAt),
    ];

    if (cursor) {
      conditions.push(lt(connectionTable.id, cursor));
    }

    return db
      .select()
      .from(connectionTable)
      .where(and(...conditions))
      .orderBy(desc(connectionTable.id))
      .limit(limit + 1);
  }

  static async findById(
    id: string,
  ): Promise<ConnectionModel | null> {
    const [connection] = await db
      .select()
      .from(connectionTable)
      .where(
        and(
          eq(connectionTable.id, id),
          isNull(connectionTable.deletedAt),
        ),
      );
    return connection ?? null;
  }

  static async findByIdAndUserId(
    id: string,
    userId: string,
  ): Promise<ConnectionModel | null> {
    const [connection] = await db
      .select()
      .from(connectionTable)
      .where(
        and(
          eq(connectionTable.id, id),
          eq(connectionTable.userId, userId),
          isNull(connectionTable.deletedAt),
        ),
      );
    return connection ?? null;
  }
}
