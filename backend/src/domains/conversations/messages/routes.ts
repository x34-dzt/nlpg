import Elysia from "elysia";
import { authGuard, ownsConversationGuard } from "~/guard";
import { MessageService } from "./service";
import {
  conversationParams,
  paginationQuerySchema,
  paginatedMessageResponseSchema,
} from "./model";
import { HttpStatus } from "~/lib/http";

export const messageRoutes = new Elysia({
  prefix: "conversations/:id/messages",
  detail: { tags: ["messages"] },
})
  .decorate("service", { message: MessageService })
  .use(authGuard)
  .use(ownsConversationGuard)
  .get(
    "/",
    async ({ params, query, service }) =>
      service.message.getMessages(params.id, query),
    {
      isAuth: true,
      ownsConversation: true,
      params: conversationParams,
      query: paginationQuerySchema,
      response: {
        [HttpStatus.HTTP_200_OK]: paginatedMessageResponseSchema,
      },
    },
  );
