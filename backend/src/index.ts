import Elysia from "elysia";
import { cors } from "@elysiajs/cors";
import swagger from "@elysiajs/swagger";
import { isDev } from "~/lib/constants";
import { errorHandler } from "./error-handler";
import { userRoutes } from "./domains/user/routes";
import { connectionRoutes } from "./domains/connections/routes";
import { conversationRoutes } from "./domains/conversations/routes";
import { messageRoutes } from "./domains/conversations/messages/routes";

const port = Number(process.env.PORT) || 3000;
const allowedOrigin = process.env.ALLOWED_ORIGIN ?? "http://localhost:5173";

function buildApp() {
  const app = new Elysia();

  if (isDev) {
    app.use(
      swagger({
        path: "/docs",
        swaggerOptions: {
          withCredentials: true,
        },
      }),
    );
  }

  return app
    .use(
      cors({
        origin: allowedOrigin,
        credentials: true,
        allowedHeaders: ["Content-Type", "Authorization"],
        methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
      }),
    )
    .onError(errorHandler)
    .use(userRoutes)
    .use(connectionRoutes)
    .use(conversationRoutes)
    .use(messageRoutes);
}

const elysia = buildApp();

elysia.get("/health", { message: "healthy" });
elysia.listen(port, () => {
  console.log(`
 Server running on port ${port}
 Docs: http://localhost:${port}/docs
`);
});
