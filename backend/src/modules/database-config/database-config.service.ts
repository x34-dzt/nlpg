import { Injectable } from "@nestjs/common";
import { DatabaseConfigRepo } from "./database-config.repo";
import {
  CreateDatabaseConfigDto,
  DatabaseConfigResponseDto,
} from "./dto/create-database-config.dto";
import { PaginationQueryDto, PaginatedResponseDto } from "./dto/pagination.dto";

const DEFAULT_LIMIT = 50;

@Injectable()
export class DatabaseConfigService {
  constructor(private readonly databaseConfigRepo: DatabaseConfigRepo) {}

  async create(
    dto: CreateDatabaseConfigDto,
    userId: string,
  ): Promise<DatabaseConfigResponseDto> {
    const config = await this.databaseConfigRepo.create(dto, userId);
    const { password, deletedAt, ...response } = config;
    return response;
  }

  async findAll(
    userId: string,
    query: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<DatabaseConfigResponseDto>> {
    const limit = query.limit ?? DEFAULT_LIMIT;
    const results = await this.databaseConfigRepo.findManyByUserId(
      userId,
      query.cursor,
      limit,
    );

    const hasNext = results.length > limit;
    const items = hasNext ? results.slice(0, limit) : results;

    const stripped = items.map(({ password, deletedAt, ...rest }) => rest);

    return {
      items: stripped,
      nextCursor: hasNext ? items[items.length - 1].id : null,
      hasNext,
    };
  }
}
