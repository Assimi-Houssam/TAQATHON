import { apiClient } from "@/lib/axios";
import { FormField } from "@/types/entities";
import { useQuery } from "@tanstack/react-query";

export function useFormFields(selectedSet: string, locale: string) {
  return useQuery({
    queryKey: ["formFields", selectedSet, locale],
    queryFn: async (): Promise<FormField[]> => {
      const encodedSet = encodeURIComponent(selectedSet);
      const { data } = await apiClient.get(
        `/forms/${encodedSet}?locale=${locale}`
      );
      return data;
    },
    enabled: !!selectedSet,
  });
}
