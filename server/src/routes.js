import express from "express";
import { pool } from "./db.js";
import { VALID_STATUSES, isNonEmptyString, clampTitle } from "./validators.js";

export const router = express.Router();

/**
 * GET /api/tasks
 */
router.get("/tasks", async (req, res) => {
  try {
    const { status, search, sort } = req.query;

    const where = [];
    const values = [];

    // status filter
    if (typeof status === "string" && status.trim()) {
      const parts = status.split(",").map(s => s.trim()).filter(Boolean);
      const filtered = parts.filter(s => VALID_STATUSES.has(s));
      if (filtered.length) {
        values.push(filtered);
        where.push(`status = ANY($${values.length})`);
      }
    }

    // text search
    if (typeof search === "string" && search.trim()) {
      values.push(`%${search.trim()}%`);
      where.push(`(title ILIKE $${values.length} OR description ILIKE $${values.length})`);
    }

    const order = (sort === "asc" ? "ASC" : "DESC");

    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
    const sql = `
      SELECT id, title, description, status, created_at, updated_at
      FROM tasks
      ${whereSql}
      ORDER BY created_at ${order}
    `;

    const result = await pool.query(sql, values);
    res.json(result.rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * POST /api/tasks
 */
router.post("/tasks", async (req, res) => {
  try {
    const { title, description = "" } = req.body ?? {};

    if (!isNonEmptyString(title)) {
      return res.status(400).json({ error: "title es requerido" });
    }

    const safeTitle = clampTitle(title);

    const result = await pool.query(
      `INSERT INTO tasks (title, description) VALUES ($1, $2)
       RETURNING id, title, description, status, created_at, updated_at`,
      [safeTitle, typeof description === "string" ? description : ""]
    );

    res.status(201).json(result.rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * PATCH /api/tasks/:id
 */
router.patch("/tasks/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) {
      return res.status(400).json({ error: "id inválido" });
    }

    const { title, description, status } = req.body ?? {};

    const updates = [];
    const values = [];

    if (typeof title === "string") {
      const t = title.trim();
      if (!t) return res.status(400).json({ error: "title no puede estar vacío" });
      values.push(clampTitle(t));
      updates.push(`title = $${values.length}`);
    }

    if (typeof description === "string") {
      values.push(description);
      updates.push(`description = $${values.length}`);
    }

    if (typeof status === "string") {
      if (!VALID_STATUSES.has(status)) {
        return res.status(400).json({ error: "status inválido" });
      }
      values.push(status);
      updates.push(`status = $${values.length}`);
    }

    if (!updates.length) {
      return res.status(400).json({ error: "Nada para actualizar" });
    }

    values.push(id);

    const sql = `
      UPDATE tasks
      SET ${updates.join(", ")}
      WHERE id = $${values.length}
      RETURNING id, title, description, status, created_at, updated_at
    `;

    const result = await pool.query(sql, values);
    const row = result.rows[0];
    if (!row) return res.status(404).json({ error: "No existe" });

    res.json(row);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * DELETE /api/tasks/:id
 */
router.delete("/tasks/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) {
      return res.status(400).json({ error: "id inválido" });
    }

    const result = await pool.query(
      `DELETE FROM tasks WHERE id = $1 RETURNING id`,
      [id]
    );

    if (!result.rows[0]) return res.status(404).json({ error: "No existe" });
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Server error" });
  }
});
