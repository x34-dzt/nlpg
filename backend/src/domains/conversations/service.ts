import { Chat } from "@db/chat/chat";
import type {
  ConversationResponse,
  PaginationQuery,
  PaginatedConversationResponse,
} from "./model";

const DEFAULT_LIMIT = 50;

class ConversationService {
  static async createConversation(
    connectionId: string,
    userId: string,
  ): Promise<ConversationResponse> {
    const conversation = await Chat.createConversation({
      createdBy: userId,
      connectionId,
    });

    if (!conversation) {
      throw new Error("Failed to create conversation");
    }

    return conversation;
  }

  static async findAll(
    connectionId: string,
    query: PaginationQuery,
  ): Promise<PaginatedConversationResponse> {
    const limit = query.limit ?? DEFAULT_LIMIT;
    const results = await Chat.findManyByConnection(
      connectionId,
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

export { ConversationService };
