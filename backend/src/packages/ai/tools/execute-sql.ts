import { tool } from "ai";
import { z } from "zod";
import type { Pool } from "pg";

const MAX_ROWS = 100;
const FORBIDDEN_PATTERNS = [
  /\bINSERT\b/i,
  /\bUPDATE\b/i,
  /\bDELETE\b/i,
  /\bDROP\b/i,
  /\bALTER\b/i,
  /\bCREATE\b/i,
  /\bTRUNCATE\b/i,
  /\bGRANT\b/i,
  /\bREVOKE\b/i,
  /\bVACUUM\b/i,
  /\bREINDEX\b/i,
];

function isReadOnly(query: string): boolean {
  return !FORBIDDEN_PATTERNS.some((p) => p.test(query));
}

export function createExecuteSqlTool(pool: Pool) {
  return tool({
    description:
      "Execute a read-only SQL query against the user's PostgreSQL database. Returns up to 100 rows.",
    inputSchema: z.object({
      query: z.string().describe("The SQL query to execute. SELECT only."),
    }),
    execute: async ({ query }) => {
      if (!isReadOnly(query)) {
        return {
          error: true,
          message:
            "Only SELECT queries are allowed. Modifying queries are forbidden.",
        };
      }

      const result = await pool.query({
        text: query,
        rowMode: "array",
      });

      const fields = result.fields.map((f) => ({
        name: f.name,
        dataTypeID: f.dataTypeID,
      }));

      const rows = result.rows.slice(0, MAX_ROWS);

      return {
        rows,
        fields,
        rowCount: result.rowCount,
        truncated: result.rows.length > MAX_ROWS,
      };
    },
  });
}
