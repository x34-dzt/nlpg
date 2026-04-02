import Elysia from "elysia";
import { UserService } from "./service";
import { registerSchema, loginSchema, authResponseSchema } from "./model";
import { HttpStatus } from "~/lib/http";

export const userRoutes = new Elysia({
  prefix: "user",
  detail: { tags: ["user"] },
})
  .decorate("service", {
    auth: UserService,
  })
  .post("/register", async ({ body, service }) => service.auth.register(body), {
    body: registerSchema,
    response: {
      [HttpStatus.HTTP_201_CREATED]: authResponseSchema,
    },
  })
  .post("/login", async ({ body, service }) => service.auth.login(body), {
    body: loginSchema,
    response: {
      [HttpStatus.HTTP_200_OK]: authResponseSchema,
    },
  });
