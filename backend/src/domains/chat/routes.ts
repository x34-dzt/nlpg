import Elysia, { t } from "elysia";
import { authGuard } from "~/guard";
import { ChatService } from "./service";
import {
  createConversationSchema,
  conversationResponseSchema,
  paginationQuerySchema,
  paginatedMessageResponseSchema,
} from "./model";
import { HttpStatus } from "~/lib/http";

export const chatRoutes = new Elysia({
  prefix: "conversations",
  detail: { tags: ["chat"] },
})
  .decorate("service", {
    chat: ChatService,
  })
  .use(authGuard)
  .post(
    "/",
    async ({ body, user, service }) =>
      service.chat.createConversation(body, user.id),
    {
      isAuth: true,
      body: createConversationSchema,
      response: {
        [HttpStatus.HTTP_201_CREATED]: conversationResponseSchema,
      },
    },
  )
  .get(
    "/:conversationId/messages",
    async ({ user, params, query, service }) =>
      service.chat.getMessages(params.conversationId, user.id, query),
    {
      isAuth: true,
      params: t.Object({ conversationId: t.String() }),
      query: paginationQuerySchema,
      response: {
        [HttpStatus.HTTP_200_OK]: paginatedMessageResponseSchema,
      },
    },
  );
