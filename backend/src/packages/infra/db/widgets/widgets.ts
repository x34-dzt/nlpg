import { db, eq, and, isNull, sql } from "@db";
import { widgetsTable } from "./widgets.sql";
import type { InferSelectModel, InferInsertModel } from "drizzle-orm";

export type WidgetModel = InferSelectModel<typeof widgetsTable>;
export type WidgetInsert = InferInsertModel<typeof widgetsTable>;

export class Widget {
  static Schema = widgetsTable;

  static async create(data: WidgetInsert): Promise<WidgetModel | null> {
    const [widget] = await db.insert(widgetsTable).values(data).returning();
    return widget ?? null;
  }

  static async findManyByConnectionId(
    userId: string,
    connectionId: string,
  ): Promise<WidgetModel[]> {
    return db
      .select()
      .from(widgetsTable)
      .where(
        and(
          eq(widgetsTable.userId, userId),
          eq(widgetsTable.connectionId, connectionId),
          isNull(widgetsTable.deletedAt),
        ),
      )
      .orderBy(
        sql`${widgetsTable.layout}->>'y' ASC, ${widgetsTable.layout}->>'x' ASC`,
      );
  }

  static async findManyByConnectionIdOnly(
    connectionId: string,
  ): Promise<WidgetModel[]> {
    return db
      .select()
      .from(widgetsTable)
      .where(
        and(
          eq(widgetsTable.connectionId, connectionId),
          isNull(widgetsTable.deletedAt),
        ),
      )
      .orderBy(
        sql`${widgetsTable.layout}->>'y' ASC, ${widgetsTable.layout}->>'x' ASC`,
      );
  }

  static async findByIdAndUserId(
    id: string,
    userId: string,
  ): Promise<WidgetModel | null> {
    const [widget] = await db
      .select()
      .from(widgetsTable)
      .where(
        and(
          eq(widgetsTable.id, id),
          eq(widgetsTable.userId, userId),
          isNull(widgetsTable.deletedAt),
        ),
      );
    return widget ?? null;
  }

  static async update(
    id: string,
    data: Partial<Pick<WidgetInsert, "title" | "chartType" | "layout">>,
  ): Promise<WidgetModel | null> {
    const [widget] = await db
      .update(widgetsTable)
      .set(data)
      .where(and(eq(widgetsTable.id, id), isNull(widgetsTable.deletedAt)))
      .returning();
    return widget ?? null;
  }

  static async updateLayouts(
    items: Array<{ id: string; layout: WidgetInsert["layout"] }>,
  ): Promise<void> {
    for (const item of items) {
      await db
        .update(widgetsTable)
        .set({ layout: item.layout })
        .where(
          and(eq(widgetsTable.id, item.id), isNull(widgetsTable.deletedAt)),
        );
    }
  }

  static async softDelete(id: string): Promise<void> {
    await db
      .update(widgetsTable)
      .set({ deletedAt: new Date() })
      .where(eq(widgetsTable.id, id));
  }
}
