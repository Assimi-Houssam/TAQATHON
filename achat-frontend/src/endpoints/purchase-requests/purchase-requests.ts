import { apiClient } from "@/lib/axios";
import { PurchaseRequest } from "@/types/entities";
import { PurchaseRequestStatus } from "@/types/entities/enums/index.enum";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface ApiError {
  message: string;
  statusCode: number;
}

export interface PurchaseRequestItem {
  estimatedPrice: number | string;
  quantity: number | string;
  categoryId?: string;
  description?: string;
  name?: string;
  unit?: string;
  specifications?: string;
  remarks?: string;
}

export interface PurchaseRequestData {
  items: PurchaseRequestItem[];
  title?: string;
  description?: string;
  requesterId?: string;
  departmentId?: string;
  priority?: "Low" | "Medium" | "High" | "Critical";
  dueDate?: string;
  status?: "draft" | "submitted";
}

const createPurchaseRequest = async (data: PurchaseRequestData) => {
  try {
    const transformedData = {
      ...data,
      items: data.items.map((item: PurchaseRequestItem) => ({
        ...item,
        estimatedPrice: Number(item.estimatedPrice),
        quantity: Number(item.quantity),
        categoryId: item.categoryId || "1",
      })),
    };

    const response = await apiClient.post(
      "/ocp/purchase-requests",
      transformedData
    );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      const apiError = error.response?.data as ApiError;
      throw new Error(apiError.message || "Failed to create purchase request");
    }
    throw error;
  }
};

export const useCreatePurchaseRequest = () => {
  const router = useRouter();
  return useMutation({
    mutationFn: createPurchaseRequest,
    onSuccess: () => {
      toast.success("Purchase request created successfully");
      router.push("/dashboard/purchase-request");
    },
    onError: (error: Error) => {
      console.error("Error creating purchase request:", error);
      toast.error(error.message || "Failed to create purchase request");
    },
  });
};

const createDraftPurchaseRequest = async (
  data: Partial<PurchaseRequestData>
) => {
  try {
    const transformedData = {
      ...data,
      items: data.items?.map((item: Partial<PurchaseRequestItem>) => ({
        ...item,
        estimatedPrice: item.estimatedPrice
          ? Number(item.estimatedPrice)
          : undefined,
        quantity: item.quantity ? Number(item.quantity) : undefined,
      })),
    };

    const response = await apiClient.post(
      "/ocp/purchase-requests/draft",
      transformedData
    );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      const apiError = error.response?.data as ApiError;
      throw new Error(
        apiError.message || "Failed to save draft purchase request"
      );
    }
    throw error;
  }
};

export const useCreateDraftPurchaseRequest = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createDraftPurchaseRequest,
    onSuccess: () => {
      toast.success("Purchase request saved as draft");
      queryClient.invalidateQueries({ queryKey: ["purchaseRequests"] });
      router.push("/dashboard/purchase-request");
    },
    onError: (error: Error) => {
      console.error("Error saving draft:", error);
      toast.error(error.message || "Failed to save draft");
    },
  });
};

export const useGetPurchaseRequests = (status?: PurchaseRequestStatus) => {
  return useQuery({
    queryKey: ["purchaseRequests", status],
    queryFn: async () => {
      const response = await apiClient.get("/ocp/purchase-requests", {
        params: { status },
      });
      return response.data as PurchaseRequest[];
    },
  });
};

export const useGetPurchaseRequestByRef = (ref: string) => {
  return useQuery({
    queryKey: ["purchaseRequest", ref],
    queryFn: async () => {
      const response = await apiClient.get(`/ocp/purchase-requests/${ref}`);
      return response.data as PurchaseRequest;
    },
  });
};
