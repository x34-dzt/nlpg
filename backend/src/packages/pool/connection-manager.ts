import { Pool } from "pg";
import { LRUCache } from "lru-cache";
import { Connection } from "@db/connections/connections";
import { NotFoundError } from "~/lib/error";

class ConnectionManager {
  private cache: LRUCache<string, Pool>;

  constructor() {
    this.cache = new LRUCache<string, Pool>({
      max: 50,
      ttl: 1000 * 60 * 30,
      dispose: (pool) => {
        pool.end();
      },
    });
  }

  async getPool(connectionId: string): Promise<Pool> {
    const cached = this.cache.get(connectionId);
    if (cached) {
      return cached;
    }

    const conn = await Connection.findById(connectionId);
    if (!conn) throw new NotFoundError("Connection not found");

    const pool = new Pool({
      host: conn.host,
      port: conn.port,
      database: conn.database,
      user: conn.username,
      password: conn.password,
      ssl: conn.ssl ? { rejectUnauthorized: false } : false,
      min: 0,
      max: 2,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 5_000,
    });

    pool.on("error", (err) => {
      console.error(
        `[Pool] Error for connection ${connectionId}:`,
        err.message,
      );
      throw new Error("failed to create the pool connection");
    });

    const client = await pool.connect();
    await client.query("SELECT 1");
    client.release();

    this.cache.set(connectionId, pool);
    return pool;
  }

  async release(connectionId: string): Promise<void> {
    this.cache.delete(connectionId);
  }
}

export const connectionManager = new ConnectionManager();
