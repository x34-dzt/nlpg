import { Chat, ConversationModel } from "@db/chat/chat";
import type { PaginationQuery, PaginatedMessageResponse } from "./model";
import { streamText, convertToModelMessages, stepCountIs } from "ai";
import type { UIMessage } from "ai";
import { Connection } from "@db/connections/connections";
import { createId } from "@db/id";
import { createModel } from "~/packages/ai/client";
import { createExecuteSqlTool } from "~/packages/ai/tools/execute-sql";
import { buildSystemPrompt } from "~/packages/ai/system-prompt";
import { connectionManager } from "~/packages/pool/connection-manager";
import { schemaCache } from "~/packages/pool/schema-cache";
import { NotFoundError } from "~/lib/error";

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
      // @ts-ignore — content is unknown after removing $type<AiSdkMessage>
      items,
      nextCursor: hasMore ? (items[items.length - 1]?.id ?? null) : null,
      hasMore,
    };
  }

  static async chat(
    conversation: ConversationModel,
    content: string,
    apiKey?: string,
  ) {
    const conversationId = conversation.id;
    const connectionId = conversation.connectionId;

    const connection = await Connection.findById(connectionId);
    if (!connection) throw new NotFoundError("Connection not found");

    const pool = await connectionManager.getPool(connection.id);
    const schema = await schemaCache.getOrInspect(pool, connection.id);
    const systemPrompt = buildSystemPrompt(schema);
    const rows = await Chat.findMessagesAsc(conversationId);

    const previousMessages: UIMessage[] = rows.map((row) => ({
      id: row.id,
      role: row.role as "user" | "assistant",
      parts: row.content as UIMessage["parts"],
    }));

    const userMessage: UIMessage = {
      id: createId("message"),
      role: "user",
      parts: [{ type: "text", text: content }],
    };

    const messages = [...previousMessages, userMessage];

    await Chat.createMessage({
      id: userMessage.id,
      role: "user",
      content: userMessage.parts,
      conversationId,
    });

    const modelMessages = await convertToModelMessages(messages);

    const model = createModel({ apiKey });

    const result = streamText({
      model,
      system: systemPrompt,
      messages: modelMessages,
      tools: { execute_sql: createExecuteSqlTool(pool) },
      stopWhen: stepCountIs(10),
    });

    return result.toUIMessageStreamResponse({
      originalMessages: messages,
      onFinish: ({ messages: updatedMessages }) => {
        (async () => {
          try {
            const newMessages = updatedMessages.slice(
              previousMessages.length + 1,
            );
            for (const msg of newMessages) {
              if (msg.role === "assistant") {
                await Chat.createMessage({
                  id: createId("message"),
                  role: "assistant",
                  content: msg.parts,
                  conversationId,
                });
              }
            }
            await Chat.updateLastUsedAt(conversationId);
          } catch (error) {
            console.error(
              `[Chat] Failed to persist messages for ${conversationId}:`,
              error,
            );
          }
        })();
      },
    });
  }
}

export { MessageService };
