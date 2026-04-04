import { tool } from "ai";
import { z } from "zod";
import type { Pool } from "pg";
import { executeReadOnlyQuery } from "~/packages/pool/query-runner";

export function createExecuteSqlTool(pool: Pool) {
  return tool({
    description:
      "Execute a read-only SQL query against the user's PostgreSQL database. Returns up to 100 rows.",
    inputSchema: z.object({
      query: z.string().describe("The SQL query to execute. SELECT only."),
    }),
    execute: async ({ query }) => {
      return executeReadOnlyQuery(pool, query);
    },
  });
}
