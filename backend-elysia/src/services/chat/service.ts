import { ChatRepo } from "./repo";
import { DatabaseConfigRepo } from "../database-config/repo";
import { ForbiddenError, NotFoundError } from "~/lib/error";
import type {
  CreateConversationSchema,
  ConversationResponse,
  PaginationQuery,
  PaginatedMessageResponse,
} from "./model";

const DEFAULT_LIMIT = 50;

class ChatService {
  static async createConversation(
    body: CreateConversationSchema,
    userId: string,
  ): Promise<ConversationResponse> {
    const configs = await DatabaseConfigRepo.findManyByUserId(
      userId,
      undefined,
      1,
    );
    const config = configs.find((c) => c.id === body.databaseConfigId);
    if (!config) {
      throw new ForbiddenError("Database config does not belong to you");
    }

    const conversation = await ChatRepo.createConversation({
      createdBy: userId,
      databaseConfigId: body.databaseConfigId,
    });

    if (!conversation) {
      throw new Error("Failed to create conversation");
    }

    return conversation;
  }

  static async getMessages(
    conversationId: string,
    userId: string,
    query: PaginationQuery,
  ): Promise<PaginatedMessageResponse> {
    const conversation = await ChatRepo.findConversationById(conversationId);
    if (!conversation) {
      throw new NotFoundError("Conversation not found");
    }
    if (conversation.createdBy !== userId) {
      throw new ForbiddenError("Conversation does not belong to you");
    }

    const limit = query.limit ?? DEFAULT_LIMIT;
    const results = await ChatRepo.findMessages(
      conversationId,
      query.cursor,
      limit,
    );

    const hasMore = results.length > limit;
    const items = hasMore ? results.slice(0, limit) : results;

    return {
      items,
      nextCursor: hasMore ? (items[items.length - 1]?.id ?? null) : null,
      hasMore,
    };
  }
}

export { ChatService };
