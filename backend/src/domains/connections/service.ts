import { Connection } from "@db/connections/connections";
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
      throw new Error("Failed to create connection");
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
    );

    const hasMore = results.length > limit;
    const items = hasMore ? results.slice(0, limit) : results;

    return {
      items,
      nextCursor: hasMore ? (items[items.length - 1]?.id ?? null) : null,
      hasMore,
    };
  }
}

export { ConnectionService };
