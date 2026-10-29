import { apiClient } from "@/lib/api-client";
import { Professional } from "@/types";

export interface ProfessionalWithServices extends Professional {
  services: {
    id: string;
    name: string;
    durationMinutes: number;
    price: number;
  }[];
}

export async function getProfessionals(): Promise<ProfessionalWithServices[]> {
  return apiClient<ProfessionalWithServices[]>("/public/professionals");
}

