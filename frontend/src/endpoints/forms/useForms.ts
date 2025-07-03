import { apiClient } from "@/lib/axios";
import { FormResponse } from "@/types/forms-controller";
import { useQuery } from "@tanstack/react-query";

export function useForms(searchTerm?: string) {
  const {
    data: forms = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["forms"],
    queryFn: async (): Promise<FormResponse[]> => {
      const { data } = await apiClient.get("/forms");
      return data;
    },
  });

  const filteredForms = forms?.filter((form) => {
    if (!searchTerm) return true;
    return form.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return {
    forms: filteredForms,
    isLoading,
    error,
  };
}
