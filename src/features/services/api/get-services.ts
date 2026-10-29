import { apiClient } from "@/lib/api-client";
import { Service } from "@/types";

export async function getServices(): Promise<Service[]> {
  return apiClient<Service[]>("/public/services");
}

