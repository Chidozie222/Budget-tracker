import { db } from "../config/db.js";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";
import { log } from "console";

const runSchema = async () => {
  const __filename = fileURLToPath(import.meta.url);
  console.log(import.meta.dirname);
  console.log(import.meta.filename);
  console.log(import.meta.url);
  const __dirname = path.dirname(__filename);

  console.log(__dirname);
  const schemaPath = path.join(__dirname, "schema.sql");
  const sql = fs.readFileSync(schemaPath, "utf8");

  try {
    await db.query(sql);
    console.log("Schema applied successfully.");
  } catch (err) {
    console.error("Failed to apply schema:", err.message);
  } finally {
    await db.end();
  }
};

runSchema();
