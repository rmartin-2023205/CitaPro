import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  cancelAppointment,
  createAppointment,
  getMyAppointments,
  type CreateAppointmentDto,
} from "../api/appointments-api";
import { getServices } from "@/features/services/api/get-services";
import { getProfessionals } from "@/features/professionals/api/get-professionals";
import { getBusiness } from "@/features/business/api/get-business";
import { getAvailability } from "@/features/booking/api/get-availability";
import { queryKeys } from "@/lib/query-keys";

export function usePublicBusiness() {
  return useQuery({
    queryKey: queryKeys.business,
    queryFn: getBusiness,
  });
}

export function usePublicServices() {
  return useQuery({
    queryKey: queryKeys.services.public,
    queryFn: getServices,
  });
}

export function usePublicProfessionals() {
  return useQuery({
    queryKey: queryKeys.professionals.public(),
    queryFn: getProfessionals,
  });
}

export function useAvailability(params: {
  serviceId?: string;
  professionalId?: string;
  date?: string;
}) {
  const enabled = Boolean(params.serviceId && params.date);
  return useQuery({
    queryKey: queryKeys.availability(params),
    queryFn: () =>
      getAvailability({
        serviceId: params.serviceId!,
        professionalId: params.professionalId,
        date: params.date!,
      }),
    enabled,
  });
}

export function useMyAppointments(enabled = true) {
  return useQuery({
    queryKey: queryKeys.appointments.mine,
    queryFn: getMyAppointments,
    enabled,
  });
}

export function useCreateAppointment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateAppointmentDto) => createAppointment(dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.appointments.all });
      qc.invalidateQueries({ queryKey: ["availability"] });
      qc.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
  });
}

export function useCancelAppointment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      cancelAppointment(id, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.appointments.all });
      qc.invalidateQueries({ queryKey: ["availability"] });
      qc.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
  });
}

