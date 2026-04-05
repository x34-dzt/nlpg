import { Connection } from "@db/connections/connections";
import { connectionManager } from "~/packages/pool/connection-manager";
import { schemaCache } from "~/packages/pool/schema-cache";
import type { SchemaInfo } from "~/packages/pool/schema-cache";
import { createId } from "@db/id";
import { InternalServerError, NotFoundError } from "~/lib/error";
import type {
  CreateConnectionSchema,
  ConnectionResponse,
  PaginationQuery,
  PaginatedConnectionResponse,
} from "./model";

const DEFAULT_LIMIT = 50;

class ConnectionService {
  static async create(
    body: CreateConnectionSchema,
    userId: string,
  ): Promise<ConnectionResponse> {
    const connection = await Connection.create({
      ...body,
      port: body.port ?? 5432,
      ssl: body.ssl ?? false,
      userId,
    });

    if (!connection) {
      throw new InternalServerError("Failed to create connection");
    }

    return connection;
  }

  static async findAll(
    userId: string,
    query: PaginationQuery,
  ): Promise<PaginatedConnectionResponse> {
    const limit = query.limit ?? DEFAULT_LIMIT;
    const results = await Connection.findManyByUserId(
      userId,
      query.cursor,
      limit,
      query.search,
    );

    const hasMore = results.length > limit;
    const items = hasMore ? results.slice(0, limit) : results;

    return {
      items,
      nextCursor: hasMore ? (items[items.length - 1]?.id ?? null) : null,
      hasMore,
    };
  }

  static async findById(
    connectionId: string,
    userId: string,
  ): Promise<ConnectionResponse> {
    const connection = await Connection.findByIdAndUserId(connectionId, userId);
    if (!connection) throw new NotFoundError("Connection not found");
    return connection;
  }

  static async healthCheck(
    connectionId: string,
    userId: string,
  ): Promise<{ status: string; message?: string }> {
    const connection = await Connection.findByIdAndUserId(connectionId, userId);
    if (!connection) throw new NotFoundError("Connection not found");

    try {
      const pool = await connectionManager.getPool(connectionId);
      const client = await pool.connect();
      try {
        await client.query("SELECT 1");
      } finally {
        client.release();
      }
      return { status: "ok" };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Connection failed";
      return { status: "error", message };
    }
  }

  static async remove(connectionId: string, userId: string): Promise<void> {
    const connection = await Connection.findByIdAndUserId(connectionId, userId);
    if (!connection) throw new NotFoundError("Connection not found");

    await Connection.softDelete(connectionId);
    await connectionManager.release(connectionId);
  }

  static async getSchema(
    connectionId: string,
    userId: string,
  ): Promise<SchemaInfo> {
    const connection = await Connection.findByIdAndUserId(connectionId, userId);
    if (!connection) throw new NotFoundError("Connection not found");

    const pool = await connectionManager.getPool(connectionId);
    return schemaCache.getOrInspect(pool, connectionId);
  }

  static async share(
    connectionId: string,
    userId: string,
  ): Promise<{ shareToken: string }> {
    const connection = await Connection.findByIdAndUserId(connectionId, userId);
    if (!connection) throw new NotFoundError("Connection not found");

    if (connection.shareToken) {
      return { shareToken: connection.shareToken };
    }

    const token = createId("share");
    await Connection.updateShareToken(connectionId, token);
    return { shareToken: token };
  }

  static async unshare(
    connectionId: string,
    userId: string,
  ): Promise<void> {
    const connection = await Connection.findByIdAndUserId(connectionId, userId);
    if (!connection) throw new NotFoundError("Connection not found");
    await Connection.updateShareToken(connectionId, null);
  }
}

export { ConnectionService };
