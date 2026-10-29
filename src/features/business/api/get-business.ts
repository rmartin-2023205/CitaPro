import { apiClient } from "@/lib/api-client";
import { Business } from "@/types";

export async function getBusiness(): Promise<Business> {
  return apiClient<Business>("/public/business");
}

