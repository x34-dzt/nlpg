import { DatabaseConfigRepo } from "./repo";
import type {
  CreateDatabaseConfigSchema,
  DatabaseConfigResponse,
  PaginationQuery,
  PaginatedDatabaseConfigResponse,
} from "./model";

const DEFAULT_LIMIT = 50;

class DatabaseConfigService {
  static async create(
    body: CreateDatabaseConfigSchema,
    userId: string,
  ): Promise<DatabaseConfigResponse> {
    const config = await DatabaseConfigRepo.create({
      ...body,
      port: body.port ?? 5432,
      ssl: body.ssl ?? false,
      userId,
    });

    if (!config) {
      throw new Error("Failed to create database config");
    }

    return config;
  }

  static async findAll(
    userId: string,
    query: PaginationQuery,
  ): Promise<PaginatedDatabaseConfigResponse> {
    const limit = query.limit ?? DEFAULT_LIMIT;
    const results = await DatabaseConfigRepo.findManyByUserId(
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

export { DatabaseConfigService };
