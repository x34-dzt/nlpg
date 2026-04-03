import { LRUCache } from "lru-cache";
import type { Pool } from "pg";
import { inspectSchema } from "~/packages/ai/schema-inspector";

export interface SchemaInfo {
  tables: Array<{
    tableName: string;
    columns: Array<{
      columnName: string;
      dataType: string;
      isNullable: boolean;
      columnDefault: string | null;
    }>;
  }>;
  foreignKeys: Array<{
    fromTable: string;
    fromColumn: string;
    toTable: string;
    toColumn: string;
  }>;
}

class SchemaCache {
  private cache = new LRUCache<string, SchemaInfo>({
    max: 50,
    ttl: 1000 * 60 * 60,
  });

  async getOrInspect(pool: Pool, connectionId: string): Promise<SchemaInfo> {
    const cached = this.cache.get(connectionId);
    if (cached) {
      return cached;
    }

    const schema = await inspectSchema(pool);
    this.cache.set(connectionId, schema);
    return schema;
  }

  invalidate(connectionId: string): void {
    this.cache.delete(connectionId);
  }
}

export const schemaCache = new SchemaCache();
