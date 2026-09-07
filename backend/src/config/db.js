import { configDotenv } from "dotenv";
import { Pool } from "pg";
configDotenv()

const db = new Pool({
  connectionString: process.env.DATABASE_URL,
});