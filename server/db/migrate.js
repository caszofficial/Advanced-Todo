import fs from "fs";
import path from "path";
import pg from "pg"
import dotenv from "dotenv";
import { fileURLToPath } from "url";

dotenv.config();

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  console.error("❌ Falta DATABASE_URL en .env");
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
   ssl: {
    rejectUnauthorized: false
  }
});


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const schemaPath = path.join(__dirname, "schema.sql");

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