import Elysia from "elysia";
import { useAuthGuard, useConnectionGuard, useWidgetGuard } from "~/guard";
import { WidgetService } from "./service";
import {
  createWidgetSchema,
  updateWidgetSchema,
  updateLayoutsSchema,
  widgetListResponseSchema,
  widgetResponseSchema,
  executeAllResponseSchema,
} from "./model";
import { HttpStatus } from "~/lib/http";

export const widgetRoutes = new Elysia({
  prefix: "connections",
  detail: { tags: ["Widgets"] },
})
  .decorate("service", {
    widget: WidgetService,
  })
  .use(useAuthGuard)
  .use(useConnectionGuard)
  .get(
    "/:connectionId/widgets",
    async ({ user, params, service }) =>
      service.widget.findAll(user.id, params.connectionId),
    {
      useConnectionGuard: true,
      response: {
        [HttpStatus.HTTP_200_OK]: widgetListResponseSchema,
      },
    },
  )
  .post(
    "/:connectionId/widgets",
    async ({ user, params, body, service }) =>
      service.widget.create(user.id, params.connectionId, body),
    {
      useConnectionGuard: true,
      body: createWidgetSchema,
      response: {
        [HttpStatus.HTTP_201_CREATED]: widgetResponseSchema,
      },
    },
  )
  .patch(
    "/:connectionId/widgets/layouts",
    async ({ user, params, body, service }) =>
      service.widget.updateLayouts(user.id, params.connectionId, body),
    {
      useConnectionGuard: true,
      body: updateLayoutsSchema,
    },
  )
  .post(
    "/:connectionId/widgets/execute",
    async ({ user, params, service }) =>
      service.widget.executeAll(user.id, params.connectionId),
    {
      useConnectionGuard: true,
      response: {
        [HttpStatus.HTTP_200_OK]: executeAllResponseSchema,
      },
    },
  )
  .use(useWidgetGuard)
  .patch(
    "/:connectionId/widgets/:widgetId",
    async ({ user, params, body, service }) =>
      service.widget.update(user.id, params.widgetId, body),
    {
      useWidgetGuard: true,
      body: updateWidgetSchema,
      response: {
        [HttpStatus.HTTP_200_OK]: widgetResponseSchema,
      },
    },
  )
  .delete(
    "/:connectionId/widgets/:widgetId",
    async ({ user, params, service }) => {
      await service.widget.remove(user.id, params.widgetId);
    },
    {
      useWidgetGuard: true,
    },
  );
