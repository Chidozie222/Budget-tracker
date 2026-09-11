import { Pool } from "pg";
import { configDotenv } from "dotenv";
configDotenv();


export const db = new Pool({
  connectionString: process.env.DATABASE_URL,
});
