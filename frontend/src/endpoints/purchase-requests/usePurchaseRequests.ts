import { apiClient } from "@/lib/axios";
import { PurchaseRequestStatus } from "@/types/entities/enums/index.enum";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export interface PurchaseRequest {
  id: number;
  request_code: string;
  title: string;
  bidding_deadline: string;
  status: PurchaseRequestStatus;
  description: string;
  department: string;
  category: string;
  purchase_visibility: PRVisibilityType;
  delivery_date: string;
  buying_entity: BuyingEntityType;
  delivery_address: string;
  biding_date: string;
  biding_address: string;
  created_at: string;
  updated_at: string;
}

export enum PRVisibilityType {
  INVITE_ONLY = "invite_only",
  PUBLIC = "public",
  HIDDEN = "hidden",
}

export enum BuyingEntityType {
  OCP_GROUP = "ocp_group",
  OCP_AFRIQUE = "ocp_afrique",
  OCP_FOUNDATION = "ocp_foundation",
  OCP_SA = "ocp_sa",
  OCP_INT = "ocp_int",
  UM6P = "um6p",
}

export interface MockAttachment {
  id: number;
  name: string;
  type: string;
  size: string;
}

export function useDraftPurchaseRequests() {
  return useQuery({
    queryKey: ["purchase-requests", "drafts"],
    queryFn: async () => {
      const { data } = await apiClient.get<PurchaseRequest[]>(
        "/ocp/purchase-requests/drafts"
      );
      return data;
    },
  });
}

export function usePublishPurchaseRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await apiClient.post(`/ocp/purchase-requests/${id}/publish`);
    },
    onSuccess: () => {
      toast.success("Purchase request published successfully");
      queryClient.invalidateQueries({
        queryKey: ["purchase-requests", "drafts"],
      });
    },
    onError: () => {
      toast.error("Failed to publish draft");
    },
  });
}

export function useDeletePurchaseRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/ocp/purchase-requests/${id}`);
    },
    onSuccess: () => {
      toast.success("Draft deleted successfully");
      queryClient.invalidateQueries({
        queryKey: ["purchase-requests", "drafts"],
      });
    },
    onError: () => {
      toast.error("Failed to delete draft");
    },
  });
}
