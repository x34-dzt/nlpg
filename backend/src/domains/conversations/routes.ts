import Elysia from "elysia";
import { useAuthGuard, useConnectionGuard } from "~/guard";
import { ConversationService } from "./service";
import {
  conversationResponseSchema,
  paginationQuerySchema,
  paginatedConversationResponseSchema,
} from "./model";
import { HttpStatus } from "~/lib/http";

export const conversationRoutes = new Elysia({
  prefix: "connections/:connectionId/conversations",
  detail: { tags: ["conversations"] },
})
  .decorate("service", {
    conversation: ConversationService,
  })
  .use(useAuthGuard)
  .use(useConnectionGuard)
  .get(
    "/",
    async ({ params, query, service }) =>
      service.conversation.findAll(params.connectionId, query),
    {
      useAuthGuard: true,
      useConnectionGuard: true,
      query: paginationQuerySchema,
      response: {
        [HttpStatus.HTTP_200_OK]: paginatedConversationResponseSchema,
      },
    },
  )
  .post(
    "/",
    async ({ params, user, service }) =>
      service.conversation.createConversation(params.connectionId, user.id),
    {
      useAuthGuard: true,
      ownsConnection: true,
      response: {
        [HttpStatus.HTTP_201_CREATED]: conversationResponseSchema,
      },
    },
  )
  .delete(
    "/:id",
    async ({ params, service }) => {
      await service.conversation.remove(params.id);
    },
    {
      useConnectionGuard: true,
      useAuthGuard: true,
    },
  );
