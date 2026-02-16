import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { pool } from "./pool.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const schemaPath = path.join(__dirname, "schema.sql");

async function migrate() {
  const sql = fs.readFileSync(schemaPath, "utf-8");
  await pool.query(sql);
  console.log("✅ Schema applied");
  await pool.end();
}

migrate()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Migration failed:", err);
    process.exit(1);
  });