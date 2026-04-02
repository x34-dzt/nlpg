import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is missing");
}

const pool = new Pool({ connectionString });

const db = drizzle(pool, { casing: "snake_case" });

export * from "drizzle-orm";
export { db };
