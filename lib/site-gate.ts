const FALSE_VALUES = new Set(["0", "false", "off", "no"]);

export const SITE_GATE_COOKIE_NAME = "peopleparty_site_gate";

function normalizeBooleanEnv(value: string | undefined, fallback: boolean) {
  if (!value) return fallback;
  return !FALSE_VALUES.has(value.trim().toLowerCase());
}

export function isSiteGateEnabled() {
  return normalizeBooleanEnv(process.env.SITE_GATE_ENABLED, true);
}

export function getSiteGateUsername() {
  return process.env.SITE_GATE_USERNAME?.trim() || process.env.ADMIN_USERNAME || "admin";
}

export function getSiteGatePassword() {
  return process.env.SITE_GATE_PASSWORD?.trim() || process.env.ADMIN_PASSWORD || "admin123";
}

export function getSiteGateToken() {
  return (
    process.env.SITE_GATE_TOKEN?.trim() ||
    process.env.APP_SESSION_SECRET?.trim() ||
    process.env.JWT_SECRET?.trim() ||
    "peopleparty-temporary-gate-token"
  );
}
