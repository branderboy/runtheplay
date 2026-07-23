import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema/index";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set. Copy .env.example to .env and add your Neon connection string.");
}

// Neon works over the standard Postgres protocol. Keep the pool small; the app
// runs mostly serverless. `prepare: false` is friendlier to Neon's pooler.
export const sql = postgres(connectionString, { max: 5, prepare: false });
export const db = drizzle(sql, { schema, casing: "snake_case" });
export { schema };
