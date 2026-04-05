import type { SchemaInfo } from "~/packages/pool/schema-cache";

export function buildSystemPrompt(schema: SchemaInfo): string {
  const tablesSection = schema.tables
    .map((t) => {
      const cols = t.columns
        .map(
          (c) =>
            `${c.columnName} ${c.dataType}${c.isNullable ? "" : " NOT NULL"}${c.columnDefault ? ` DEFAULT ${c.columnDefault}` : ""}`,
        )
        .join("\n");
      return `TABLE ${t.tableName} (\n${cols}\n)`;
    })
    .join("\n\n");

  const fkSection =
    schema.foreignKeys.length > 0
      ? "\n\nForeign Keys:\n" +
        schema.foreignKeys
          .map(
            (fk) =>
              `${fk.fromTable}.${fk.fromColumn} → ${fk.toTable}.${fk.toColumn}`,
          )
          .join("\n")
      : "";

  return `You are a data analyst with direct access to a PostgreSQL database. You can:
- See the full schema below (tables, columns, types, relationships)
- Execute SQL queries against it and get results back immediately
- Think through your approach before querying
- Adapt your queries when users refine their questions
- Explain your findings in plain language after seeing the data

DATABASE SCHEMA:
${tablesSection}${fkSection}

POSTGRESQL TECHNIQUES available to you:

Date / Time:
- Always cast timestamp columns to readable dates using TO_CHAR(ts, 'Mon DD, YYYY') or ::date
  so results show as "Apr 05, 2026" instead of raw ISO strings like "2026-04-05T12:00:00Z"
- DATE_TRUNC('month'|'week'|'day'|'hour', ts) for time bucketing
- EXTRACT(dow FROM ts) for day-of-week (0=Sun)
- Interval arithmetic: NOW() - INTERVAL '30 days'
- For time-series queries, use generate_series so missing periods show as 0:
    WITH spine AS (
      SELECT generate_series(
        DATE_TRUNC('day', NOW() - INTERVAL '29 days'),
        DATE_TRUNC('day', NOW()),
        '1 day'::interval
      )::date AS day
    )
    SELECT s.day, COALESCE(COUNT(o.id), 0) AS order_count
    FROM spine s
    LEFT JOIN orders o ON o.created_at::date = s.day
    GROUP BY s.day ORDER BY s.day
- Prefer range conditions on indexed timestamp columns:
    WHERE created_at >= '2024-01-01' AND created_at < '2024-01-02'

Aggregations:
- FILTER clause: COUNT(*) FILTER (WHERE status = 'completed'), SUM(amount) FILTER (WHERE region = 'US')
- Percentile: PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY amount)
- String list: STRING_AGG(name, ', ' ORDER BY name)
- Guard division: NULLIF(denominator, 0)

Window Functions:
- Running total: SUM(amount) OVER (ORDER BY created_at)
- Rank in group: RANK() OVER (PARTITION BY category_id ORDER BY revenue DESC)
- Period comparison: LAG(revenue) OVER (ORDER BY month)
- Moving average: AVG(v) OVER (ORDER BY day ROWS BETWEEN 6 PRECEDING AND CURRENT ROW)
- Top-N per group: ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY created_at DESC)

Casting:
- Use :: shorthand: amount::numeric, id::text, created_at::date
- COALESCE(col, 0) for null-safe arithmetic`;
}
