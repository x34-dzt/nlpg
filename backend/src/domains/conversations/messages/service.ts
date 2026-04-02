import { Chat } from "@db/chat/chat";
import type {
  PaginationQuery,
  PaginatedMessageResponse,
} from "./model";

const DEFAULT_LIMIT = 50;

class MessageService {
  static async getMessages(
    conversationId: string,
    query: PaginationQuery,
  ): Promise<PaginatedMessageResponse> {
    const limit = query.limit ?? DEFAULT_LIMIT;
    const results = await Chat.findMessages(
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

export { MessageService };
