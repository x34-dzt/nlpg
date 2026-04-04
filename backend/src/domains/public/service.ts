import { NotFoundError } from "~/lib/error";
import { Connection } from "@db/connections/connections";
import { Widget, WidgetModel } from "~/packages/infra/db/widgets/widgets";
import { connectionManager } from "~/packages/pool";
import { executeReadOnlyQuery, SqlResult } from "~/packages/pool/query-runner";

export class PublicService {
  static async findSharedDashboard(shareToken: string): Promise<{
    connection: { displayName: string };
    widgets: WidgetModel[];
    results: { widgetId: string; result: SqlResult }[];
  }> {
    const connection = await Connection.findByShareToken(shareToken);
    if (!connection) throw new NotFoundError("Dashboard not found");

    const widgets = await Widget.findManyByConnectionIdOnly(connection.id);
    if (widgets.length === 0) {
      return {
        connection: { displayName: connection.displayName },
        widgets: [],
        results: [],
      };
    }

    const pool = await connectionManager.getPool(connection.id);

    const settled = await Promise.allSettled(
      widgets.map(async (widget) => ({
        widgetId: widget.id,
        result: await executeReadOnlyQuery(pool, widget.sqlQuery),
      })),
    );

    const results = settled.map((s, i) => {
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

    return {
      connection: { displayName: connection.displayName },
      widgets,
      results,
    };
  }
}
