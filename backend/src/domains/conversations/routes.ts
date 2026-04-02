import Elysia from "elysia";
import { authGuard, ownsConnectionGuard } from "~/guard";
import { ConversationService } from "./service";
import {
  connectionParams,
  conversationResponseSchema,
  paginationQuerySchema,
  paginatedConversationResponseSchema,
} from "./model";
import { HttpStatus } from "~/lib/http";

export const conversationRoutes = new Elysia({
  prefix: "conversations",
  detail: { tags: ["conversations"] },
})
  .decorate("service", {
    conversation: ConversationService,
  })
  .use(authGuard)
  .use(ownsConnectionGuard)
  .get(
    "/:connectionId",
    async ({ params, query, service }) =>
      service.conversation.findAll(params.connectionId, query),
    {
      isAuth: true,
      ownsConnection: true,
      params: connectionParams,
      query: paginationQuerySchema,
      response: {
        [HttpStatus.HTTP_200_OK]: paginatedConversationResponseSchema,
      },
    },
  )
  .post(
    "/:connectionId",
    async ({ params, user, service }) =>
      service.conversation.createConversation(params.connectionId, user.id),
    {
      isAuth: true,
      ownsConnection: true,
      params: connectionParams,
      response: {
        [HttpStatus.HTTP_201_CREATED]: conversationResponseSchema,
      },
    },
  );
