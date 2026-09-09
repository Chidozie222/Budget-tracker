import { configDotenv } from "dotenv";
import { Pool } from "pg";
configDotenv()

export const db = new Pool({
  connectionString: process.env.DATABASE_URL,
});