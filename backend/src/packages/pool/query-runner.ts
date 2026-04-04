import type { Pool } from "pg";

const MAX_ROWS = 100;
const QUERY_TIMEOUT_MS = 30000;

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

export function isReadOnly(query: string): boolean {
  return !FORBIDDEN_PATTERNS.some((p) => p.test(query));
}

export interface SqlResult {
  rows: Record<string, unknown>[];
  fields: { name: string; dataTypeID: number }[];
  rowCount: number;
  truncated: boolean;
  durationMs: number;
  error?: boolean;
  message?: string;
}

export async function executeReadOnlyQuery(
  pool: Pool,
  query: string,
): Promise<SqlResult> {
  if (!isReadOnly(query)) {
    return {
      rows: [],
      fields: [],
      rowCount: 0,
      truncated: false,
      durationMs: 0,
      error: true,
      message:
        "Only SELECT queries are allowed. Modifying queries are forbidden.",
    };
  }

  const start = Date.now();

  let result;
  try {
    const client = await pool.connect();
    try {
      await client.query(`SET statement_timeout TO ${QUERY_TIMEOUT_MS}`);
      result = await client.query({ text: query });
    } finally {
      client.release();
    }
  } catch (err: any) {
    return {
      rows: [],
      fields: [],
      rowCount: 0,
      truncated: false,
      durationMs: Date.now() - start,
      error: true,
      message: err?.message ?? "Query execution failed",
    };
  }

  const durationMs = Date.now() - start;

  const fields = result.fields.map((f: any) => ({
    name: f.name,
    dataTypeID: f.dataTypeID,
  }));

  const rows = result.rows.slice(0, MAX_ROWS);

  return {
    rows,
    fields,
    rowCount: result.rowCount ?? 0,
    truncated: result.rows.length > MAX_ROWS,
    durationMs,
  };
}
