import { apiClient } from "@/lib/api-client";
import { Appointment, AppointmentStatus, ProfessionalWithServices } from "@/types";

export async function getProfessionalProfile(): Promise<ProfessionalWithServices> {
  return apiClient<ProfessionalWithServices>("/professional/me");
}

export async function getProfessionalAgenda(
  from?: string,
  to?: string
): Promise<Appointment[]> {
  const query = new URLSearchParams();
  if (from) query.set("from", from);
  if (to) query.set("to", to);
  const qs = query.toString();
  return apiClient<Appointment[]>(`/professional/agenda${qs ? `?${qs}` : ""}`);
}

export async function updateAppointmentStatus(
  id: string,
  status: AppointmentStatus,
  reason?: string
): Promise<Appointment> {
  return apiClient<Appointment>(`/appointments/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status, reason }),
  });
}

