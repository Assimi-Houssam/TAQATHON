import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/axios";
import { Departement } from "@/types/entities";

export function useDepartments() {
  return useQuery<Departement[]>({
    queryKey: ["departements"],
    queryFn: async () => {
      const response = await apiClient.get("/departements");
      return response.data;
    },
  });
}
