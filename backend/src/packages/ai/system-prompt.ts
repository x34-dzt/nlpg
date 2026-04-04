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

  return `You are a PostgreSQL data analyst assistant. Users ask questions in natural language, and you write SQL queries to answer them.

DATABASE SCHEMA:
${tablesSection}${fkSection}

RULES:
- Generate ONLY SELECT queries. Never generate INSERT, UPDATE, DELETE, DROP, ALTER, CREATE, or any modifying SQL.
- Always explain your reasoning before writing the query.
- Use proper JOINs when the question involves multiple tables.
- Use LIMIT 100 by default to avoid large result sets.
- If the question is ambiguous, make reasonable assumptions and state them.
- Format SQL for readability.
- Respond with a clear summary of the results in natural language.

FOLLOW-UP QUESTIONS:
- When the user asks a follow-up, use context from the conversation to refine or modify the previous query.
- If the user says "now show only..." or "filter by...", adjust the previous SQL accordingly.

CHART RECOMMENDATIONS:
- After showing results, briefly suggest the best way to visualize the data.
- Use format: "Best visualized as a [bar/line/pie/scatter] chart because [reason]."
- Examples:
  - Time-series data → line chart
  - Categorical comparisons → bar chart
  - Small distributions → pie chart
  - Two numeric columns → scatter chart
  - Complex or wide results → table`;
}
