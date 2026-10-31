import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getProfessionalAgenda,
  getProfessionalProfile,
  updateAppointmentStatus,
} from "../api/professional-api";
import type { AppointmentStatus } from "@/types";
import { queryKeys } from "@/lib/query-keys";

export function useProfessionalProfile() {
  return useQuery({
    queryKey: ["professional", "me"],
    queryFn: getProfessionalProfile,
  });
}

export function useProfessionalAgenda(from?: string, to?: string) {
  return useQuery({
    queryKey: queryKeys.appointments.professional({ from, to }),
    queryFn: () => getProfessionalAgenda(from, to),
  });
}

export function useUpdateAgendaStatus() {
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

