export function isAdminUser(user) {
  return Boolean(user && user.role === "admin");
}

export function accessDisplayName(account) {
  const first = String(account?.first_name || "").trim();
  const last = String(account?.last_name || "").trim();
  const full = [first, last].filter(Boolean).join(" ").trim();
  return full || String(account?.username || "—");
}

export function accessRoleLabel(role) {
  return role === "admin" ? "Administrador" : "Operador";
}
