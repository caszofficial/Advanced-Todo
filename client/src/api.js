const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export async function listTasks({ statuses = [], search = "", sort = "desc" } = {}) {
  const params = new URLSearchParams();
  if (statuses.length) params.set("status", statuses.join(","));
  if (search.trim()) params.set("search", search.trim());
  if (sort) params.set("sort", sort);

  const res = await fetch(`${API_URL}/api/tasks?${params.toString()}`);
  if (!res.ok) throw new Error("No se pudieron cargar tareas");
  return res.json();
}

export async function createTask(payload) {
  const res = await fetch(`${API_URL}/api/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const j = await safeJson(res);
    throw new Error(j?.error || "No se pudo crear");
  }
  return res.json();
}

export async function updateTask(id, patch) {
  const res = await fetch(`${API_URL}/api/tasks/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  if (!res.ok) {
    const j = await safeJson(res);
    throw new Error(j?.error || "No se pudo actualizar");
  }
  return res.json();
}

export async function deleteTask(id) {
  const res = await fetch(`${API_URL}/api/tasks/${id}`, { method: "DELETE" });
  if (!res.ok) {
    const j = await safeJson(res);
    throw new Error(j?.error || "No se pudo eliminar");
  }
  return res.json();
}

async function safeJson(res) {
  try { return await res.json(); } catch { return null; }
}
