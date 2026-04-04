import Elysia from "elysia";
import { PublicService } from "./service";
import { HttpStatus } from "~/lib/http";
import { publicDashboardResponseSchema, publicDashboardParams } from "./model";

export const publicRoutes = new Elysia({
  prefix: "public/dashboard",
  detail: { tags: ["public"] },
}).get(
  ":shareToken",
  async ({ params }) => PublicService.findSharedDashboard(params.shareToken),
  {
    params: publicDashboardParams,
    response: {
      [HttpStatus.HTTP_200_OK]: publicDashboardResponseSchema,
    },
  },
);
