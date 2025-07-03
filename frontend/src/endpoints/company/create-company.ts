import { apiClient } from "@/lib/axios";
import { CompanyFormData } from "@/types/company-form-schema";
import { useMutation } from "@tanstack/react-query";

export const useCreateCompany = () => {
  return useMutation({
    mutationFn: async (data: CompanyFormData) => {
      const response = await apiClient.post("/companies", data);
      return response.data;
    },
  });
};
