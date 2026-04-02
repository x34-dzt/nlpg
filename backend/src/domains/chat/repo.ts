import { db, eq, lt, desc, and, isNull } from "@db";
import {
  conversationTable,
  messageTable,
  type ConversationModel,
  type ConversationCreate,
  type MessageModel,
} from "@db/chat";

export class ChatRepo {
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
