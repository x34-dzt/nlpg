import Elysia from "elysia";
import { authGuard } from "~/guard";
import { ConnectionService } from "./service";
import {
  createConnectionSchema,
  paginationQuerySchema,
  connectionResponseSchema,
  paginatedConnectionResponseSchema,
} from "./model";
import { HttpStatus } from "~/lib/http";

export const connectionRoutes = new Elysia({
  prefix: "connections",
  detail: { tags: ["connections"] },
})
  .decorate("service", {
    connection: ConnectionService,
  })
  .use(authGuard)
  .post(
    "/",
    async ({ body, user, service }) =>
      service.connection.create(body, user.id),
    {
      isAuth: true,
      body: createConnectionSchema,
      response: {
        [HttpStatus.HTTP_201_CREATED]: connectionResponseSchema,
      },
    },
  )
  .get(
    "/",
    async ({ user, query, service }) =>
      service.connection.findAll(user.id, query),
    {
      isAuth: true,
      query: paginationQuerySchema,
      response: {
        [HttpStatus.HTTP_200_OK]: paginatedConnectionResponseSchema,
      },
    },
  );
