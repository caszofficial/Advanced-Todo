# Advanced To‑Do List (React + Node + PostgreSQL)

Una To‑Do List **avanzada** con estados (**pendiente / en progreso / completado**), filtros y persistencia real en **SQL (PostgreSQL)**.

## ✅ Funcionalidades
- CRUD de tareas (crear, listar, editar, eliminar)
- Estado por tarea: `pending` | `in_progress` | `completed`
- Filtros:
  - por estado (uno o varios)
  - búsqueda por texto (título/descripcion)
  - orden por fecha (más reciente / más antigua)
- Persistencia real con DB (no localStorage)

---

## 1) Requisitos
- Node.js 18+
- PostgreSQL 14+ (local o Docker)
- npm

---

## 2) Configurar Base de Datos

### Opción A: PostgreSQL local
1. Crea una base de datos (ejemplo):
   ```sql
   CREATE DATABASE todo_advanced;
   ```
2. Ejecuta el script:
   ```bash
   psql -d todo_advanced -f server/db/schema.sql
   ```

---

## 3) Backend (Node + Express)

```bash
cd server
cp .env.example .env
npm install
npm run dev
```

El backend queda en: `http://localhost:4000`

---

## 4) Frontend (React)

```bash
cd client
npm install
npm run dev
```

El frontend queda en: `http://localhost:5173`

---

## 5) Endpoints principales (Backend)
- `GET /api/tasks?status=pending,in_progress&search=algo&sort=desc`
- `POST /api/tasks`
- `PATCH /api/tasks/:id`
- `DELETE /api/tasks/:id`

