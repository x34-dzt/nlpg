import { Logger, Module, Provider } from "@nestjs/common";
import { Pool } from "pg";
import { drizzle, NodePgDatabase } from "drizzle-orm/node-postgres";
import * as models from "./models";

export const DRIZZLE = "drizzle";
export type DrizzleDB = NodePgDatabase<typeof models>;

const DrizzleProvider: Provider = {
  provide: DRIZZLE,
  useFactory: () => {
    const logger = new Logger("DatabaseModule");
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      logger.error("DATABASE_URL not provided in the environment");
    }

    const pool = new Pool({
      connectionString,
    });

    const db = drizzle(pool, { casing: "snake_case" });
    logger.log("DATABASE Initialized");
    return db;
  },
};

@Module({
  providers: [DrizzleProvider],
  exports: [DrizzleProvider],
})
export class DatabaseModule {}
