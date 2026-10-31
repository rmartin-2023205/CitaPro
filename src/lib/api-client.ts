import type { ProblemDetail } from "@/types";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api/v1";

export const SESSION_EXPIRED_EVENT = "citapro:session-expired";

/** Endpoints donde un 401 es esperado y no debe disparar el aviso de sesión expirada. */
const SILENT_401_ENDPOINTS = new Set(["/auth/me", "/auth/login", "/auth/register"]);

/**
 * Error tipado para cualquier respuesta no exitosa del backend.
 * Envuelve el `ProblemDetail` (RFC 7807) que devuelve Spring Boot.
 */
export class ApiError extends Error {
  readonly status: number;
  readonly title: string;
  readonly detail: string;
  readonly fieldErrors?: Record<string, string>;

  constructor(problem: Partial<ProblemDetail> & { status: number }) {
    const detail = problem.detail || problem.title || "Ocurrió un error inesperado.";
    super(detail);
    this.name = "ApiError";
    this.status = problem.status;
    this.title = problem.title || "Error";
    this.detail = detail;
    this.fieldErrors = problem.errors;
  }

  get isUnauthorized() {
    return this.status === 401;
  }

  get isForbidden() {
    return this.status === 403;
  }

  get isConflict() {
    return this.status === 409;
  }
}

/** Extrae un mensaje legible de cualquier error lanzado (ApiError, Error, ProblemDetail plano, etc.). */
export function getErrorMessage(error: unknown, fallback = "Ocurrió un error inesperado."): string {
  if (error instanceof ApiError) return error.detail;
  if (error instanceof TypeError) {
    return "No se pudo conectar con el servidor. Verifica tu conexión e intenta de nuevo.";
  }
  if (error instanceof Error && error.message) return error.message;
  if (error && typeof error === "object") {
    const maybe = error as Partial<ProblemDetail>;
    return maybe.detail || maybe.title || fallback;
  }
  return fallback;
}

export async function apiClient<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const normalizedEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const url = `${BASE_URL}${normalizedEndpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...options.headers,
    },
    credentials: "include", // Permite envío de la cookie de sesión HttpOnly
  });

  if (!response.ok) {
    if (
      response.status === 401 &&
      typeof window !== "undefined" &&
      !SILENT_401_ENDPOINTS.has(normalizedEndpoint)
    ) {
      window.dispatchEvent(new CustomEvent(SESSION_EXPIRED_EVENT));
    }

    const problem = await response.json().catch(() => ({
      status: response.status,
      title: "Error inesperado",
      detail: response.statusText,
    }));
    throw new ApiError({ ...problem, status: problem?.status ?? response.status });
  }

  if (response.status === 204 || response.headers.get("content-length") === "0") {
    return undefined as T;
  }

  return response.json();
}
