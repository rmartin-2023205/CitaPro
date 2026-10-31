import type { AppointmentFilterParams } from "@/features/admin/api/admin-api";

/**
 * Claves centralizadas de TanStack Query.
 * Mantenerlas aquí garantiza que las invalidaciones entre features sean consistentes
 * (p. ej. cambiar el estado de una cita refresca dashboard, agenda y "mis citas").
 */
export const queryKeys = {
  auth: {
    me: ["auth", "me"] as const,
  },
  business: ["business"] as const,
  services: {
    public: ["services", "public"] as const,
    admin: ["services", "admin"] as const,
  },
  professionals: {
    public: (serviceId?: string) => ["professionals", "public", serviceId ?? "all"] as const,
    admin: ["professionals", "admin"] as const,
  },
  availability: (params: { serviceId?: string; professionalId?: string; date?: string }) =>
    ["availability", params] as const,
  appointments: {
    all: ["appointments"] as const,
    mine: ["appointments", "mine"] as const,
    admin: (filters?: AppointmentFilterParams) => ["appointments", "admin", filters ?? {}] as const,
    professional: (params?: Record<string, unknown>) =>
      ["appointments", "professional", params ?? {}] as const,
  },
  dashboard: ["dashboard"] as const,
  blocks: ["blocks"] as const,
};

