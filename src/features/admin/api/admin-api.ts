import { apiClient } from "@/lib/api-client";
import {
  Appointment,
  AppointmentStatus,
  AvailabilityBlock,
  DashboardSummary,
  ProfessionalWithServices,
  Service,
} from "@/types";

export interface CreateServiceInput {
  name: string;
  description?: string;
  durationMinutes: number;
  price: number;
}

export interface UpdateServiceInput {
  name?: string;
  description?: string;
  durationMinutes?: number;
  price?: number;
  active?: boolean;
}

export interface CreateProfessionalInput {
  displayName: string;
  bio?: string;
  userId?: string;
  serviceIds?: string[];
}

export interface UpdateProfessionalInput {
  displayName?: string;
  bio?: string;
  active?: boolean;
  serviceIds?: string[];
}

export interface CreateBlockInput {
  professionalId?: string;
  startAt: string;
  endAt: string;
  reason?: string;
}

export interface AppointmentFilterParams {
  from?: string;
  to?: string;
  professionalId?: string;
  status?: AppointmentStatus;
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  return apiClient<DashboardSummary>("/admin/dashboard");
}

export async function getAdminAppointments(
  params?: AppointmentFilterParams
): Promise<Appointment[]> {
  const query = new URLSearchParams();
  if (params?.from) query.set("from", params.from);
  if (params?.to) query.set("to", params.to);
  if (params?.professionalId) query.set("professionalId", params.professionalId);
  if (params?.status) query.set("status", params.status);

  const qs = query.toString();
  return apiClient<Appointment[]>(`/admin/appointments${qs ? `?${qs}` : ""}`);
}

export async function getAllAdminServices(): Promise<Service[]> {
  return apiClient<Service[]>("/admin/services");
}

export async function createService(data: CreateServiceInput): Promise<Service> {
  return apiClient<Service>("/admin/services", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateService(
  id: string,
  data: UpdateServiceInput
): Promise<Service> {
  return apiClient<Service>(`/admin/services/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteService(id: string): Promise<void> {
  return apiClient<void>(`/admin/services/${id}`, {
    method: "DELETE",
  });
}

export async function getAllAdminProfessionals(): Promise<ProfessionalWithServices[]> {
  return apiClient<ProfessionalWithServices[]>("/admin/professionals");
}

export async function createProfessional(
  data: CreateProfessionalInput
): Promise<ProfessionalWithServices> {
  return apiClient<ProfessionalWithServices>("/admin/professionals", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateProfessional(
  id: string,
  data: UpdateProfessionalInput
): Promise<ProfessionalWithServices> {
  return apiClient<ProfessionalWithServices>(`/admin/professionals/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function getAllBlocks(): Promise<AvailabilityBlock[]> {
  return apiClient<AvailabilityBlock[]>("/admin/blocks");
}

export async function createBlock(
  data: CreateBlockInput
): Promise<AvailabilityBlock> {
  return apiClient<AvailabilityBlock>("/admin/blocks", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function deleteBlock(id: string): Promise<void> {
  return apiClient<void>(`/admin/blocks/${id}`, {
    method: "DELETE",
  });
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

