export const VALID_STATUSES = new Set(["pending", "in_progress", "completed"]);

export function isNonEmptyString(v) {
  return typeof v === "string" && v.trim().length > 0;
}

export function clampTitle(title) {
  const t = title.trim();
  return t.length > 120 ? t.slice(0, 120) : t;
}
