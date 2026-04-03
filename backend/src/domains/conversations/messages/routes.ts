import Elysia from "elysia";
import { useAuthGuard, useConversationGuard } from "~/guard";
import { MessageService } from "./service";
import {
  paginationQuerySchema,
  paginatedMessageResponseSchema,
  createMessageRequest,
} from "./model";
import { HttpStatus } from "~/lib/http";

export const messageRoutes = new Elysia({
  prefix: "conversations/:id/messages",
  detail: { tags: ["messages"] },
})
  .decorate("service", { message: MessageService })
  .use(useAuthGuard)
  .use(useConversationGuard)
  .get(
    "/",
    async ({ params, query, service }) =>
      service.message.getMessages(params.id, query),
    {
      useAuthGuard: true,
      ownsConversation: true,
      query: paginationQuerySchema,
      response: {
        [HttpStatus.HTTP_200_OK]: paginatedMessageResponseSchema,
      },
    },
  )
  .post(
    "/",
    async ({ body, headers, service, conversation }) => {
      const apiKey = headers["x-ai-api-key"] as string | undefined;
      service.message.chat(conversation, body.content, apiKey);
    },
    {
      useAuthGuard: true,
      useConversationGuard: true,
      body: createMessageRequest,
    },
  );
