import type { Pool } from "pg";
import type { SchemaInfo } from "~/packages/pool/schema-cache";

export async function inspectSchema(pool: Pool): Promise<SchemaInfo> {
  const columnsResult = await pool.query(`
    SELECT
      c.table_name,
      c.column_name,
      c.data_type,
      c.is_nullable,
      c.column_default
    FROM information_schema.columns c
    WHERE c.table_schema = 'public'
    ORDER BY c.table_name, c.ordinal_position
  `);

  const fkResult = await pool.query(`
    SELECT
      kcu.table_name   AS from_table,
      kcu.column_name  AS from_column,
      ccu.table_name   AS to_table,
      ccu.column_name  AS to_column
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu
      ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage ccu
      ON tc.constraint_name = ccu.constraint_name
    WHERE tc.constraint_type = 'FOREIGN KEY'
      AND tc.table_schema = 'public'
  `);

  const tablesMap = new Map<string, SchemaInfo["tables"][0]>();
  for (const row of columnsResult.rows) {
    if (!tablesMap.has(row.table_name)) {
      tablesMap.set(row.table_name, { tableName: row.table_name, columns: [] });
    }
    tablesMap.get(row.table_name)!.columns.push({
      columnName: row.column_name,
      dataType: row.data_type,
      isNullable: row.is_nullable === "YES",
      columnDefault: row.column_default,
    });
  }

  const tables = Array.from(tablesMap.values());
  const foreignKeys = fkResult.rows.map((r) => ({
    fromTable: r.from_table,
    fromColumn: r.from_column,
    toTable: r.to_table,
    toColumn: r.to_column,
  }));

  return {
    tables,
    foreignKeys,
  };
}
