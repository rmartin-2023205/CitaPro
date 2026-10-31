import type { User, UserRole } from "../types";

export const LOGIN_PATH = "/iniciar-sesion";
export const REGISTER_PATH = "/registro";

/** Página de inicio según el rol de mayor privilegio del usuario. */
export function getHomePathForUser(user: Pick<User, "roles"> | null | undefined): string {
  if (!user) return "/";
  if (user.roles.includes("ADMIN")) return "/admin";
  if (user.roles.includes("PROFESSIONAL")) return "/profesional/agenda";
  return "/";
}

/**
 * Evita open-redirects y descarta rutas públicas neutras ("/")
 * para que tras iniciar sesión o registrarse el usuario siempre aterrice
 * en su vista autenticada o en la ruta protegida que intentaba abrir.
 */
export function sanitizeRedirect(raw: string | null | undefined): string | null {
  if (!raw) return null;
  try {
    const decoded = decodeURIComponent(raw).trim();
    if (!decoded.startsWith("/") || decoded.startsWith("//") || decoded.startsWith("/\\")) {
      return null;
    }
    if (
      decoded === "/" ||
      decoded.startsWith(LOGIN_PATH) ||
      decoded.startsWith(REGISTER_PATH)
    ) {
      return null;
    }
    return decoded;
  } catch {
    return null;
  }
}

/** Destino después de autenticarse: el redirect solicitado (si es específico y seguro) o el home del rol. */
export function resolvePostAuthPath(user: User, redirect: string | null | undefined): string {
  return sanitizeRedirect(redirect) ?? getHomePathForUser(user);
}

export function buildLoginHref(redirectTo?: string): string {
  const safe = sanitizeRedirect(redirectTo);
  return safe ? `${LOGIN_PATH}?redirect=${encodeURIComponent(safe)}` : LOGIN_PATH;
}

export const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: "Administrador",
  PROFESSIONAL: "Profesional",
  CLIENT: "Cliente",
};
