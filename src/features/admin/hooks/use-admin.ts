import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createBlock,
  createProfessional,
  createService,
  deleteBlock,
  deleteService,
  getAdminAppointments,
  getAllAdminProfessionals,
  getAllAdminServices,
  getAllBlocks,
  getDashboardSummary,
  updateAppointmentStatus,
  updateProfessional,
  updateService,
  type AppointmentFilterParams,
  type CreateBlockInput,
  type CreateProfessionalInput,
  type CreateServiceInput,
  type UpdateProfessionalInput,
  type UpdateServiceInput,
} from "../api/admin-api";
import type { AppointmentStatus } from "@/types";
import { queryKeys } from "@/lib/query-keys";

export function useDashboardSummary() {
  return useQuery({
    queryKey: queryKeys.dashboard,
    queryFn: getDashboardSummary,
  });
}

export function useAdminAppointments(filters?: AppointmentFilterParams) {
  return useQuery({
    queryKey: queryKeys.appointments.admin(filters),
    queryFn: () => getAdminAppointments(filters),
  });
}

export function useUpdateAppointmentStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      status,
      reason,
    }: {
      id: string;
      status: AppointmentStatus;
      reason?: string;
    }) => updateAppointmentStatus(id, status, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.appointments.all });
      qc.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
  });
}

export function useAdminServices() {
  return useQuery({
    queryKey: queryKeys.services.admin,
    queryFn: getAllAdminServices,
  });
}

export function useCreateService() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateServiceInput) => createService(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.services.admin });
      qc.invalidateQueries({ queryKey: queryKeys.services.public });
      qc.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
  });
}

export function useUpdateService() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateServiceInput }) =>
      updateService(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.services.admin });
      qc.invalidateQueries({ queryKey: queryKeys.services.public });
    },
  });
}

export function useDeleteService() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteService(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.services.admin });
      qc.invalidateQueries({ queryKey: queryKeys.services.public });
      qc.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
  });
}

export function useAdminProfessionals() {
  return useQuery({
    queryKey: queryKeys.professionals.admin,
    queryFn: getAllAdminProfessionals,
  });
}

export function useCreateProfessional() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateProfessionalInput) => createProfessional(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.professionals.admin });
      qc.invalidateQueries({ queryKey: ["professionals", "public"] });
      qc.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
  });
}

export function useUpdateProfessional() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProfessionalInput }) =>
      updateProfessional(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.professionals.admin });
      qc.invalidateQueries({ queryKey: ["professionals", "public"] });
    },
  });
}

export function useAdminBlocks() {
  return useQuery({
    queryKey: queryKeys.blocks,
    queryFn: getAllBlocks,
  });
}

export function useCreateBlock() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateBlockInput) => createBlock(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.blocks });
      qc.invalidateQueries({ queryKey: ["availability"] });
    },
  });
}

export function useDeleteBlock() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteBlock(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.blocks });
      qc.invalidateQueries({ queryKey: ["availability"] });
    },
  });
}

