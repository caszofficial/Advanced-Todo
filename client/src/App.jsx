import React, { useEffect, useMemo, useState } from "react";
import { createTask, deleteTask, listTasks, updateTask } from "./api.js";
import { styles } from "./styles.js";

const STATUS_LABEL = {
  pending: "Pendiente",
  in_progress: "En progreso",
  completed: "Completado",
};

const ALL_STATUSES = ["pending", "in_progress", "completed"];

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("desc");
  const [statusFilter, setStatusFilter] = useState({
    pending: true,
    in_progress: true,
    completed: true,
  });

  const activeStatuses = useMemo(() => {
    return ALL_STATUSES.filter(s => statusFilter[s]);
  }, [statusFilter]);

  async function refresh() {
    setLoading(true);
    setErr("");
    try {
      const data = await listTasks({ statuses: activeStatuses, search, sort });
      setTasks(data);
    } catch (e) {
      setErr(e.message || "Error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, sort, statusFilter]);

  async function onCreate(e) {
    e.preventDefault();
    setErr("");
    const t = title.trim();
    if (!t) return setErr("El título es requerido.");
    try {
      const created = await createTask({ title: t, description });
      setTitle("");
      setDescription("");
      setTasks(prev => [created, ...prev]);
    } catch (e) {
      setErr(e.message || "Error");
    }
  }

  async function onPatch(id, patch) {
    setErr("");
    try {
      const updated = await updateTask(id, patch);
      setTasks(prev => prev.map(t => (t.id === id ? updated : t)));
    } catch (e) {
      setErr(e.message || "Error");
    }
  }

  async function onDelete(id) {
    setErr("");
    const ok = confirm("¿Eliminar esta tarea?");
    if (!ok) return;
    try {
      await deleteTask(id);
      setTasks(prev => prev.filter(t => t.id !== id));
    } catch (e) {
      setErr(e.message || "Error");
    }
  }

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div>
          <h1 style={styles.h1}>Advanced To‑Do (React + Node + SQL)</h1>
          <div style={styles.small}>Estados, filtros y persistencia real (PostgreSQL).</div>
        </div>
        <a style={styles.small} href="http://localhost:4000/health" target="_blank" rel="noreferrer">
          health check ↗
        </a>
      </header>

      <section style={styles.card}>
        <form onSubmit={onCreate} style={{ display: "grid", gap: 10 }}>
          <div style={styles.row}>
            <input
              style={styles.input}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Título (ej: Llamar al cliente)"
              maxLength={120}
            />
            <button style={styles.btn} type="submit">Crear</button>
          </div>
          <textarea
            style={styles.textarea}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descripción (opcional)"
          />
        </form>

        {err ? (
          <div style={{ marginTop: 10, padding: 10, borderRadius: 10, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(239,68,68,0.12)" }}>
            {err}
          </div>
        ) : null}
      </section>

      <section style={{ ...styles.card, marginTop: 14 }}>
        <div style={styles.row}>
          <input
            style={styles.input}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por título o descripción..."
          />
          <select style={styles.select} value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="desc">Más reciente</option>
            <option value="asc">Más antigua</option>
          </select>
        </div>

        <div style={{ ...styles.row, marginTop: 10 }}>
          {ALL_STATUSES.map((s) => (
            <label key={s} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input
                type="checkbox"
                checked={statusFilter[s]}
                onChange={(e) => setStatusFilter(prev => ({ ...prev, [s]: e.target.checked }))}
              />
              <span style={styles.pill(s)}>{STATUS_LABEL[s]}</span>
            </label>
          ))}
        </div>

        <div style={styles.list}>
          {loading ? (
            <div style={styles.small}>Cargando…</div>
          ) : tasks.length === 0 ? (
            <div style={styles.small}>No hay tareas con los filtros actuales.</div>
          ) : (
            tasks.map((t) => (
              <TaskRow key={t.id} task={t} onPatch={onPatch} onDelete={onDelete} />
            ))
          )}
        </div>
      </section>
    </div>
  );
}

function TaskRow({ task, onPatch, onDelete }) {
  const [edit, setEdit] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description ?? "");

  useEffect(() => {
    setTitle(task.title);
    setDescription(task.description ?? "");
  }, [task.id, task.title, task.description]);

  async function save() {
    const t = title.trim();
    if (!t) return alert("Título requerido.");
    await onPatch(task.id, { title: t, description });
    setEdit(false);
  }

  return (
    <div style={styles.task}>
      <div>
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <span style={styles.pill(task.status)}>{STATUS_LABEL[task.status]}</span>
          <span style={{ fontWeight: 700 }}>{task.title}</span>
          <span style={styles.small}>#{task.id}</span>
        </div>

        {edit ? (
          <div style={{ display: "grid", gap: 10, marginTop: 10 }}>
            <input style={styles.input} value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} />
            <textarea style={styles.textarea} value={description} onChange={(e) => setDescription(e.target.value)} />
            <div style={styles.row}>
              <button style={styles.btn} onClick={save} type="button">Guardar</button>
              <button style={styles.btn} onClick={() => setEdit(false)} type="button">Cancelar</button>
            </div>
          </div>
        ) : (
          <div style={{ marginTop: 8, whiteSpace: "pre-wrap", opacity: 0.92 }}>
            {task.description ? task.description : <span style={styles.small}>Sin descripción</span>}
          </div>
        )}

        <div style={{ marginTop: 10, ...styles.small }}>
          Creada: {new Date(task.created_at).toLocaleString()}
          {" · "}
          Actualizada: {new Date(task.updated_at).toLocaleString()}
        </div>
      </div>

      <div style={{ display: "grid", gap: 10, justifyItems: "end" }}>
        <select
          style={styles.select}
          value={task.status}
          onChange={(e) => onPatch(task.id, { status: e.target.value })}
        >
          <option value="pending">{STATUS_LABEL.pending}</option>
          <option value="in_progress">{STATUS_LABEL.in_progress}</option>
          <option value="completed">{STATUS_LABEL.completed}</option>
        </select>

        <button style={styles.btn} onClick={() => setEdit(v => !v)} type="button">
          {edit ? "Cerrar edición" : "Editar"}
        </button>

        <button style={styles.btnDanger} onClick={() => onDelete(task.id)} type="button">
          Eliminar
        </button>
      </div>
    </div>
  );
}
