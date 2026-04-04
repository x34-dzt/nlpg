import Elysia from "elysia";
import { useAuthGuard, useConnectionGuard } from "~/guard";
import { ConnectionService } from "./service";
import {
  createConnectionSchema,
  paginationQuerySchema,
  connectionResponseSchema,
  paginatedConnectionResponseSchema,
  healthResponseSchema,
  schemaResponseSchema,
  shareResponseSchema,
} from "./model";
import { HttpStatus } from "~/lib/http";

export const connectionRoutes = new Elysia({
  prefix: "connections",
  detail: { tags: ["connections"] },
})
  .decorate("service", {
    connection: ConnectionService,
  })
  .use(useAuthGuard)
  .get(
    "/",
    async ({ user, query, service }) =>
      service.connection.findAll(user.id, query),
    {
      useAuthGuard: true,
      query: paginationQuerySchema,
      response: {
        [HttpStatus.HTTP_200_OK]: paginatedConnectionResponseSchema,
      },
    },
  )
  .post(
    "/",
    async ({ body, user, service }) => service.connection.create(body, user.id),
    {
      useAuthGuard: true,
      body: createConnectionSchema,
      response: {
        [HttpStatus.HTTP_201_CREATED]: connectionResponseSchema,
      },
    },
  )
  .use(useConnectionGuard)
  .get(
    "/:connectionId",
    async ({ params, user, service }) =>
      service.connection.findById(params.connectionId, user.id),
    {
      useAuthGuard: true,
      useConnectionGuard: true,
      response: {
        [HttpStatus.HTTP_200_OK]: connectionResponseSchema,
      },
    },
  )
  .get(
    "/:connectionId/health",
    async ({ params, user, service }) =>
      service.connection.healthCheck(params.connectionId, user.id),
    {
      useAuthGuard: true,
      useConnectionGuard: true,
      response: {
        [HttpStatus.HTTP_200_OK]: healthResponseSchema,
      },
    },
  )
  .get(
    "/:connectionId/schema",
    async ({ params, user, service }) =>
      service.connection.getSchema(params.connectionId, user.id),
    {
      useConnectionGuard: true,
      response: {
        [HttpStatus.HTTP_200_OK]: schemaResponseSchema,
      },
    },
  )
  .post(
    "/:connectionId/share",
    async ({ params, user, service }) =>
      service.connection.share(params.connectionId, user.id),
    {
      useConnectionGuard: true,
      response: {
        [HttpStatus.HTTP_200_OK]: shareResponseSchema,
      },
    },
  )
  .delete(
    "/:connectionId/share",
    async ({ params, user, service }) => {
      await service.connection.unshare(params.connectionId, user.id);
    },
    {
      useConnectionGuard: true,
    },
  )
  .delete(
    "/:connectionId",
    async ({ params, user, service }) => {
      await service.connection.remove(params.connectionId, user.id);
    },
    {
      useAuthGuard: true,
      useConnectionGuard: true,
    },
  );
