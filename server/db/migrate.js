import fs from "fs";
import path from "path";
import { pool } from "./pool.js";

const schemaPath = path.join(process.cwd(), "server/db/schema.sql");

async function migrate() {
  const sql = fs.readFileSync(schemaPath, "utf-8");
  await pool.query(sql);
  console.log("✅ Schema applied");
}

migrate()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Migration failed:", err);
    process.exit(1);
  });