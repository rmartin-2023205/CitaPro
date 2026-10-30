const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api/v1";

export const SESSION_EXPIRED_EVENT = "citapro:session-expired";

export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const normalizedEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const url = `${BASE_URL}${normalizedEndpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    credentials: "include", // Permite envío de cookies de sesión
  });

  if (!response.ok) {
    if (
      response.status === 401 &&
      typeof window !== "undefined" &&
      normalizedEndpoint !== "/auth/me" &&
      normalizedEndpoint !== "/auth/login"
    ) {
      window.dispatchEvent(new CustomEvent(SESSION_EXPIRED_EVENT));
    }

    const errorData = await response.json().catch(() => ({
      status: response.status,
      title: "Error inesperado",
      detail: response.statusText,
    }));
    throw errorData;
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}
