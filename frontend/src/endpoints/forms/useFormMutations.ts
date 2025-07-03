import { apiClient } from "@/lib/axios";
import { CreateFormFieldDto, LayoutConfig } from "@/types/forms-controller";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useCreateForm() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { name: string; description?: string }) => {
      const response = await apiClient.post("/forms", data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["forms"] });
      toast.success("Form created successfully");
      return data;
    },
    onError: () => {
      toast.error("Failed to create form");
    },
  });
}

export function useCreateFormField() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formField: CreateFormFieldDto) => {
      const { data } = await apiClient.post("/forms/fields", {
        ...formField,
        formName: formField.formName,
      });
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["forms"] });
      queryClient.invalidateQueries({
        queryKey: ["formFields", variables.formName],
      });
      toast.success("Form field created successfully");
    },
    onError: () => toast.error("Failed to create form field"),
  });
}

export function useSubmitFormAnswers() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (answers: Record<string, string>) => {
      const formData = new FormData();
      Object.entries(answers).forEach(([key, value]) => {
        const formFieldId = key.replace("formfield_", "");
        formData.append(formFieldId, value);
      });

      const { data } = await apiClient.post("/forms/answers", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["formFields"] });
      toast.success("Answers submitted successfully");
    },
    onError: (error) => {
      toast.error("Failed to submit answers");
      console.error(error);
    },
  });
}

export function useSaveFormLayout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      formName,
      layout,
    }: {
      formName: string;
      layout: LayoutConfig;
    }) => {
      const encodedSet = encodeURIComponent(formName);
      const { data } = await apiClient.post(`/forms/${encodedSet}/layout`, {
        layout,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forms"] });
      toast.success("Layout saved successfully");
    },
    onError: (error) => {
      toast.error("Failed to save layout");
      console.error(error);
    },
  });
}

export function useDeleteFormField() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formFieldId: string) => {
      await apiClient.delete(`/forms/fields/${formFieldId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["formFields"] });
      toast.success("Form field deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete form field");
    },
  });
}
