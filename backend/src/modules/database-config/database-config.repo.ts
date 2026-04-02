import { Inject, Injectable } from "@nestjs/common";
import { DRIZZLE, type DrizzleDB } from "../../infra/database/database.module";
import {
  databaseConfigTable,
  DatabaseConfigModel,
} from "../../infra/database/models";
import { CreateDatabaseConfigDto } from "./dto/create-database-config.dto";
import { eq, lt, desc, isNull, and } from "drizzle-orm";

@Injectable()
export class DatabaseConfigRepo {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  async create(
    data: CreateDatabaseConfigDto,
    userId: string,
  ): Promise<DatabaseConfigModel> {
    const result = await this.db
      .insert(databaseConfigTable)
      .values({
        displayName: data.displayName,
        host: data.host,
        port: data.port,
        database: data.database,
        username: data.username,
        password: data.password,
        ssl: data.ssl,
        userId,
      })
      .returning();

    const config = result[0];
    if (!config) {
      throw new Error("Failed to create database config");
    }
    return config;
  }

  async findManyByUserId(
    userId: string,
    cursor: string | undefined,
    limit: number,
  ): Promise<DatabaseConfigModel[]> {
    const conditions = [
      eq(databaseConfigTable.userId, userId),
      isNull(databaseConfigTable.deletedAt),
    ];

    if (cursor) {
      conditions.push(lt(databaseConfigTable.id, cursor));
    }

    return this.db
      .select()
      .from(databaseConfigTable)
      .where(and(...conditions))
      .orderBy(desc(databaseConfigTable.id))
      .limit(limit + 1);
  }
}
