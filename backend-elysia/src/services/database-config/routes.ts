import Elysia from "elysia";
import { authGuard } from "~/guard";
import { DatabaseConfigService } from "./service";
import {
  createDatabaseConfigSchema,
  paginationQuerySchema,
  databaseConfigResponseSchema,
  paginatedDatabaseConfigResponseSchema,
} from "./model";
import { HttpStatus } from "~/lib/http";

export const databaseConfigRoutes = new Elysia({
  prefix: "database-config",
  detail: { tags: ["database-config"] },
})
  .decorate("service", {
    databaseConfig: DatabaseConfigService,
  })
  .use(authGuard)
  .post(
    "/",
    async ({ body, user, service }) =>
      service.databaseConfig.create(body, user.id),
    {
      isAuth: true,
      body: createDatabaseConfigSchema,
      response: {
        [HttpStatus.HTTP_201_CREATED]: databaseConfigResponseSchema,
      },
    },
  )
  .get(
    "/",
    async ({ user, query, service }) =>
      service.databaseConfig.findAll(user.id, query),
    {
      isAuth: true,
      query: paginationQuerySchema,
      response: {
        [HttpStatus.HTTP_200_OK]: paginatedDatabaseConfigResponseSchema,
      },
    },
  );
