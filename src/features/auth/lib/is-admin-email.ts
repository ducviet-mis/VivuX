const ADMIN_EMAILS = new Set(["vietdang293.vn@gmail.com", "vietdang293@gmail.com"]);

export function isAdminEmail(email?: string | null) {
  return Boolean(email && ADMIN_EMAILS.has(email));
}
