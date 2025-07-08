import { apiClient } from "@/lib/axios";
import { 
  ActionPlan, 
  ActionPlanFormData, 
  ActionPlanUpdateData, 
  ActionPlanStatus,
  ActionPlansResponse,
  ActionPlanItem,
  actionPlanToItem,
  formDataToPlan,
  actionItemToPlan
} from '@/types/action-plan';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";

export interface UseActionPlansOptions {
  enabled?: boolean;
  anomalyId?: string;
}

export function useActionPlans(options: UseActionPlansOptions = {}) {
  const { 
    enabled = true,
    anomalyId
  } = options;

  return useQuery({
    queryKey: ["action-plans", anomalyId],
    queryFn: async () => {
      const url = anomalyId 
        ? `/anomaly/action_plans/${anomalyId}` 
        : '/action-plans';
      
      const { data } = await apiClient.get<ActionPlansResponse>(url);
      
      return {
        actionPlans: data.data || [],
        actionPlanItems: (data.data || []).map(actionPlanToItem),
        total: data.total || 0,
        totalPages: data.totalPages || 0,
        currentPage: data.currentPage || 1,
        hasNext: data.hasNext || false,
        hasPrevious: data.hasPrevious || false,
      };
    },
    enabled: enabled && !!anomalyId,
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}

export function useActionPlan(id: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ["action-plan", id],
    queryFn: async () => {
      const { data } = await apiClient.get<ActionPlan>(`/action-plans/${id}`);
      return {
        actionPlan: data,
        actionPlanItem: actionPlanToItem(data)
      };
    },
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}

export function useActionPlanMutations() {
  const queryClient = useQueryClient();

  const createActionPlan = useMutation({
    mutationFn: async ({ anomalyId, data }: { anomalyId: string; data: ActionPlanFormData }): Promise<ActionPlan> => {
      const planData = formDataToPlan(data);
      const response = await apiClient.post<ActionPlan>(`/anomaly/action_plan/${anomalyId}`, planData);
      return response.data;
    },
    onSuccess: (data, variables) => {
      // Invalidate action plans for this anomaly
      queryClient.invalidateQueries({ queryKey: ["action-plans", variables.anomalyId] });
      // Invalidate anomaly data as it might include action plan counts
      queryClient.invalidateQueries({ queryKey: ["anomaly", variables.anomalyId] });
      queryClient.invalidateQueries({ queryKey: ["anomalies"] });
    },
  });

  const updateActionPlan = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ActionPlanUpdateData }): Promise<ActionPlan> => {
      const response = await apiClient.patch<ActionPlan>(`/action-plans/${id}`, data);
      return response.data;
    },
    onSuccess: (data, variables) => {
      // Update the specific action plan in cache
      queryClient.setQueryData(["action-plan", variables.id], {
        actionPlan: data,
        actionPlanItem: actionPlanToItem(data)
      });
      // Invalidate action plans queries
      queryClient.invalidateQueries({ queryKey: ["action-plans"] });
      // Invalidate related anomaly data
      if (data.anomaly_id) {
        queryClient.invalidateQueries({ queryKey: ["anomaly", data.anomaly_id] });
      }
    },
  });

  const updateActionPlanFromItem = useMutation({
    mutationFn: async ({ id, item, anomalyId }: { id: string; item: ActionPlanItem; anomalyId?: string }): Promise<ActionPlan> => {
      const planData = actionItemToPlan(item, anomalyId);
      const response = await apiClient.patch<ActionPlan>(`/action-plans/${id}`, planData);
      return response.data;
    },
    onSuccess: (data, variables) => {
      // Update the specific action plan in cache
      queryClient.setQueryData(["action-plan", variables.id], {
        actionPlan: data,
        actionPlanItem: actionPlanToItem(data)
      });
      // Invalidate action plans queries
      queryClient.invalidateQueries({ queryKey: ["action-plans"] });
      // Invalidate related anomaly data
      if (data.anomaly_id) {
        queryClient.invalidateQueries({ queryKey: ["anomaly", data.anomaly_id] });
      }
    },
  });

  const updateActionPlanStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: ActionPlanStatus }): Promise<ActionPlan> => {
      const response = await apiClient.patch<ActionPlan>(`/action-plans/${id}/status`, { status });
      return response.data;
    },
    onSuccess: (data, variables) => {
      // Update the specific action plan in cache
      queryClient.setQueryData(["action-plan", variables.id], {
        actionPlan: data,
        actionPlanItem: actionPlanToItem(data)
      });
      // Invalidate action plans queries
      queryClient.invalidateQueries({ queryKey: ["action-plans"] });
      // Invalidate related anomaly data
      if (data.anomaly_id) {
        queryClient.invalidateQueries({ queryKey: ["anomaly", data.anomaly_id] });
      }
    },
  });

  const toggleActionPlanStatus = useMutation({
    mutationFn: async ({ id, currentStatus }: { id: string; currentStatus: ActionPlanStatus }): Promise<ActionPlan> => {
      const newStatus = currentStatus === ActionPlanStatus.COMPLETED 
        ? ActionPlanStatus.NOT_COMPLETED 
        : ActionPlanStatus.COMPLETED;
      
      const response = await apiClient.patch<ActionPlan>(`/action-plans/${id}/status`, { status: newStatus });
      return response.data;
    },
    onSuccess: (data, variables) => {
      // Update the specific action plan in cache
      queryClient.setQueryData(["action-plan", variables.id], {
        actionPlan: data,
        actionPlanItem: actionPlanToItem(data)
      });
      // Invalidate action plans queries
      queryClient.invalidateQueries({ queryKey: ["action-plans"] });
      // Invalidate related anomaly data
      if (data.anomaly_id) {
        queryClient.invalidateQueries({ queryKey: ["anomaly", data.anomaly_id] });
      }
    },
  });

  const deleteActionPlan = useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await apiClient.delete(`/action-plans/${id}`);
    },
    onSuccess: (_, id) => {
      // Remove the specific action plan from cache
      queryClient.removeQueries({ queryKey: ["action-plan", id] });
      // Invalidate action plans queries
      queryClient.invalidateQueries({ queryKey: ["action-plans"] });
      // Invalidate anomalies as action plan counts might change
      queryClient.invalidateQueries({ queryKey: ["anomalies"] });
    },
  });

  const batchCreateActionPlans = useMutation({
    mutationFn: async ({ anomalyId, items }: { anomalyId: string; items: ActionPlanFormData[] }): Promise<ActionPlan[]> => {
      const planDataArray = items.map(formDataToPlan);
      const response = await apiClient.post<ActionPlan[]>(`/anomaly/${anomalyId}/action-plans/batch`, { plans: planDataArray });
      return response.data;
    },
    onSuccess: (data, variables) => {
      // Invalidate action plans for this anomaly
      queryClient.invalidateQueries({ queryKey: ["action-plans", variables.anomalyId] });
      // Invalidate anomaly data
      queryClient.invalidateQueries({ queryKey: ["anomaly", variables.anomalyId] });
      queryClient.invalidateQueries({ queryKey: ["anomalies"] });
    },
  });

  const batchUpdateActionPlans = useMutation({
    mutationFn: async ({ updates }: { updates: { id: string; data: ActionPlanUpdateData }[] }): Promise<ActionPlan[]> => {
      const response = await apiClient.patch<ActionPlan[]>('/action-plans/batch', { updates });
      return response.data;
    },
    onSuccess: (data) => {
      // Invalidate action plans queries
      queryClient.invalidateQueries({ queryKey: ["action-plans"] });
      // Invalidate affected anomaly data
      const anomalyIds = [...new Set(data.map(plan => plan.anomaly_id).filter(Boolean))];
      anomalyIds.forEach(anomalyId => {
        queryClient.invalidateQueries({ queryKey: ["anomaly", anomalyId] });
      });
    },
  });

  const batchDeleteActionPlans = useMutation({
    mutationFn: async (ids: string[]): Promise<void> => {
      await apiClient.delete('/action-plans/batch', { data: { ids } });
    },
    onSuccess: (_, ids) => {
      // Remove specific action plans from cache
      ids.forEach(id => {
        queryClient.removeQueries({ queryKey: ["action-plan", id] });
      });
      // Invalidate action plans queries
      queryClient.invalidateQueries({ queryKey: ["action-plans"] });
      // Invalidate anomalies
      queryClient.invalidateQueries({ queryKey: ["anomalies"] });
    },
  });

  return {
    createActionPlan,
    updateActionPlan,
    updateActionPlanFromItem,
    updateActionPlanStatus,
    toggleActionPlanStatus,
    deleteActionPlan,
    batchCreateActionPlans,
    batchUpdateActionPlans,
    batchDeleteActionPlans,
  };
}

// Helper hook for getting action plan statistics
export function useActionPlanStats(anomalyId?: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ["action-plan-stats", anomalyId],
    queryFn: async () => {
      const url = anomalyId 
        ? `/anomaly/action_plans/${anomalyId}/stats` 
        : '/action-plans/stats';
      
      const { data } = await apiClient.get<{
        total: number;
        completed: number;
        not_completed: number;
        completion_rate: number;
      }>(url);
      
      return data;
    },
    enabled: enabled && !!anomalyId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
} 