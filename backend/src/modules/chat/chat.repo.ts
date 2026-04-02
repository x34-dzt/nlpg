import { Inject, Injectable } from "@nestjs/common";
import { DRIZZLE, type DrizzleDB } from "../../infra/database/database.module";
import {
  conversationTable,
  messageTable,
  ConversationModel,
  MessageModel,
} from "../../infra/database/models";
import { eq, lt, desc, isNull, and } from "drizzle-orm";

@Injectable()
export class ChatRepo {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  async createConversation(
    data: { databaseConfigId: string },
    userId: string,
  ): Promise<ConversationModel> {
    const result = await this.db
      .insert(conversationTable)
      .values({
        createdBy: userId,
        databaseConfigId: data.databaseConfigId,
      })
      .returning();

    const conversation = result[0];
    if (!conversation) {
      throw new Error("Failed to create conversation");
    }
    return conversation;
  }

  async findConversationById(
    conversationId: string,
  ): Promise<ConversationModel | undefined> {
    const result = await this.db
      .select()
      .from(conversationTable)
      .where(
        and(
          eq(conversationTable.id, conversationId),
          isNull(conversationTable.deletedAt),
        ),
      );

    return result[0];
  }

  async findMessages(
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

    return this.db
      .select()
      .from(messageTable)
      .where(and(...conditions))
      .orderBy(desc(messageTable.id))
      .limit(limit + 1);
  }
}
