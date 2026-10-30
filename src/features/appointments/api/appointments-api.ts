import { apiClient } from "@/lib/api-client";
import { Appointment } from "@/types";

export interface CreateAppointmentDto {
  serviceId: string;
  professionalId: string;
  startAt: string; // ISO-8601
  notes?: string;
}

export async function createAppointment(dto: CreateAppointmentDto): Promise<Appointment> {
  return apiClient<Appointment>("/appointments", {
    method: "POST",
    body: JSON.stringify(dto),
  });
}

export async function getMyAppointments(): Promise<Appointment[]> {
  return apiClient<Appointment[]>("/appointments/my");
}

export async function getAppointmentById(id: string): Promise<Appointment> {
  return apiClient<Appointment>(`/appointments/${id}`);
}

export async function cancelAppointment(id: string, reason?: string): Promise<Appointment> {
  return apiClient<Appointment>(`/appointments/${id}/cancel`, {
    method: "PATCH",
    body: JSON.stringify({ reason }),
  });
}
