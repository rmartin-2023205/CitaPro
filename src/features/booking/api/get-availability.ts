import { apiClient } from "@/lib/api-client";
import { AvailabilityResponse } from "@/types";

interface GetAvailabilityParams {
  serviceId: string;
  professionalId?: string;
  date: string; // YYYY-MM-DD
}

export async function getAvailability({
  serviceId,
  professionalId,
  date,
}: GetAvailabilityParams): Promise<AvailabilityResponse> {
  const params = new URLSearchParams({
    serviceId,
    date,
  });

  if (professionalId) {
    params.append("professionalId", professionalId);
  }

  return apiClient<AvailabilityResponse>(`/public/availability?${params.toString()}`);
}

