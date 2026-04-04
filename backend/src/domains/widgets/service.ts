import { Widget } from "@db/widgets/widgets";
import type { WidgetModel } from "@db/widgets/widgets";
import { connectionManager } from "~/packages/pool/connection-manager";
import {
  executeReadOnlyQuery,
  type SqlResult,
} from "~/packages/pool/query-runner";
import {
  NotFoundError,
  ForbiddenError,
  InternalServerError,
} from "~/lib/error";
import type {
  CreateWidgetInput,
  UpdateWidgetInput,
  UpdateLayoutsInput,
} from "./model";

function computeDefaultLayout(existing: WidgetModel[]): {
  x: number;
  y: number;
  w: number;
  h: number;
} {
  if (existing.length === 0) return { x: 0, y: 0, w: 6, h: 4 };

  const maxY = Math.max(...existing.map((w) => w.layout.y + w.layout.h));
  const lastRow = existing.filter((w) => w.layout.y + w.layout.h === maxY);
  const lastInRow = lastRow.sort((a, b) => b.layout.x - a.layout.x)[0];

  if (lastInRow.layout.x + lastInRow.layout.w + 6 <= 12) {
    return {
      x: lastInRow.layout.x + lastInRow.layout.w,
      y: lastInRow.layout.y,
      w: 6,
      h: 4,
    };
  }

  return { x: 0, y: maxY, w: 6, h: 4 };
}

class WidgetService {
  static async create(
    userId: string,
    connectionId: string,
    data: CreateWidgetInput,
  ) {
    const existing = await Widget.findManyByConnectionId(userId, connectionId);
    const layout = data.layout ?? computeDefaultLayout(existing);

    const widget = await Widget.create({
      ...data,
      userId,
      connectionId,
      layout,
    });

    if (!widget) throw new InternalServerError("Failed to create widget");
    return widget;
  }

  static async findAll(userId: string, connectionId: string) {
    return Widget.findManyByConnectionId(userId, connectionId);
  }

  static async update(
    userId: string,
    widgetId: string,
    data: UpdateWidgetInput,
  ) {
    const widget = await Widget.findByIdAndUserId(widgetId, userId);
    if (!widget) throw new NotFoundError("Widget not found");

    const updated = await Widget.update(widgetId, data);
    if (!updated) throw new NotFoundError("Failed to update widget");
    return updated;
  }

  static async updateLayouts(
    userId: string,
    connectionId: string,
    data: UpdateLayoutsInput,
  ) {
    for (const item of data.widgets) {
      const widget = await Widget.findByIdAndUserId(item.id, userId);
      if (!widget || widget.connectionId !== connectionId) {
        throw new ForbiddenError(
          "Widget does not belong to you or this connection",
        );
      }
    }

    await Widget.updateLayouts(data.widgets);
  }

  static async remove(userId: string, widgetId: string) {
    const widget = await Widget.findByIdAndUserId(widgetId, userId);
    if (!widget) throw new NotFoundError("Widget not found");
    await Widget.softDelete(widgetId);
  }

  static async executeAll(
    userId: string,
    connectionId: string,
  ): Promise<{ widgetId: string; result: SqlResult }[]> {
    const widgets = await Widget.findManyByConnectionId(userId, connectionId);
    if (widgets.length === 0) return [];

    const pool = await connectionManager.getPool(connectionId);

    const settled = await Promise.allSettled(
      widgets.map(async (widget) => ({
        widgetId: widget.id,
        result: await executeReadOnlyQuery(pool, widget.sqlQuery),
      })),
    );

    return settled.map((s, i) => {
      if (s.status === "fulfilled") return s.value;
      return {
        widgetId: widgets[i].id,
        result: {
          rows: [],
          fields: [],
          rowCount: 0,
          truncated: false,
          durationMs: 0,
          error: true,
          message: s.reason?.message ?? "Query execution failed",
        },
      };
    });
  }
}

export { WidgetService };
