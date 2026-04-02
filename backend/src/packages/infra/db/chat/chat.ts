import { db, eq, lt, desc, and, isNull } from "@db";
import {
  conversationTable,
  messageTable,
} from "./chat.sql";
import type { InferSelectModel, InferInsertModel } from "drizzle-orm";

export type ConversationModel = InferSelectModel<typeof conversationTable>;
export type ConversationCreate = InferInsertModel<typeof conversationTable>;
export type MessageModel = InferSelectModel<typeof messageTable>;
export type MessageCreate = InferInsertModel<typeof messageTable>;

export class Chat {
  static ConversationSchema = conversationTable;
  static MessageSchema = messageTable;

  static async createConversation(
    data: ConversationCreate,
  ): Promise<ConversationModel | null> {
    const [conversation] = await db
      .insert(conversationTable)
      .values(data)
      .returning();
    return conversation ?? null;
  }

  static async findConversationById(
    conversationId: string,
  ): Promise<ConversationModel | null> {
    const [conversation] = await db
      .select()
      .from(conversationTable)
      .where(
        and(
          eq(conversationTable.id, conversationId),
          isNull(conversationTable.deletedAt),
        ),
      );
    return conversation ?? null;
  }

  static async findManyByConnection(
    connectionId: string,
    cursor: string | undefined,
    limit: number,
  ): Promise<ConversationModel[]> {
    const conditions = [
      eq(conversationTable.connectionId, connectionId),
      isNull(conversationTable.deletedAt),
    ];

    if (cursor) {
      conditions.push(lt(conversationTable.id, cursor));
    }

    return db
      .select()
      .from(conversationTable)
      .where(and(...conditions))
      .orderBy(desc(conversationTable.id))
      .limit(limit + 1);
  }

  static async findMessages(
    conversationId: string,
    cursor: string | undefined,
    limit: number,
  ): Promise<MessageModel[]> {
    const conditions = [
      eq(messageTable.conversationId, conversationId),
      isNull(messageTable.deletedAt),
    ];

    if (cursor) {
      conditions.push(lt(messageTable.id, cursor));
    }

    return db
      .select()
      .from(messageTable)
      .where(and(...conditions))
      .orderBy(desc(messageTable.id))
      .limit(limit + 1);
  }
}
