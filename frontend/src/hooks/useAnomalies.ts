import { apiClient } from "@/lib/axios";
import { Anomaly, AnomalyFormData, AnomalyUpdateData, AnomalyStatus } from '@/types/anomaly';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";

export interface UseAnomaliesOptions {
  status?: AnomalyStatus;
  criticality?: string;
  equipment?: string;
  limit?: number;
  offset?: number;
  enabled?: boolean;
}

interface AnomaliesResponse {
  anomalies: Anomaly[];
  total?: number;
}

interface AnomalyStatsResponse {
  total: number;
  by_status: Record<AnomalyStatus, number>;
  by_criticality: Record<string, number>;
  recent_count: number;
}

export function useAnomalies(options: UseAnomaliesOptions = {}) {
  const { 
    status, 
    criticality, 
    equipment, 
    limit, 
    offset, 
    enabled = true 
  } = options;

  return useQuery({
    queryKey: ["anomalies", status, criticality, equipment, limit, offset],
    queryFn: async () => {
      const params: Record<string, string | number> = {};
      if (status) params.status = status;
      if (criticality) params.criticality = criticality;
      if (equipment) params.equipment = equipment;
      if (limit) params.limit = limit;
      if (offset) params.offset = offset;

      const { data } = await apiClient.get<AnomaliesResponse>('/anomaly/getAnomaly', { params });
      
      return {
        anomalies: data.anomalies || [],
        total: data.total || 0,
      };
    },
    enabled,
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}

export function useAnomaly(id: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ["anomaly", id],
    queryFn: async () => {
      const { data } = await apiClient.get<Anomaly>(`/anomaly/getAnomalyById/${id}`);
      return data;
    },
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}

export function useAnomalyMutations() {
  const queryClient = useQueryClient();

  const createAnomaly = useMutation({
    mutationFn: async (data: AnomalyFormData): Promise<Anomaly> => {
      const response = await apiClient.post<Anomaly>('/anomaly/createAnomaly', data);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate and refetch anomalies list and stats
      queryClient.invalidateQueries({ queryKey: ["anomalies"] });
      queryClient.invalidateQueries({ queryKey: ["anomaly-stats"] });
    },
  });

  const updateAnomaly = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: AnomalyUpdateData }): Promise<Anomaly> => {
      const response = await apiClient.patch<Anomaly>(`/anomaly/updateAnomaly/${id}`, data);
      return response.data;
    },
    onSuccess: (data, variables) => {
      // Update the specific anomaly in cache
      queryClient.setQueryData(["anomaly", variables.id], data);
      // Invalidate anomalies list and stats
      queryClient.invalidateQueries({ queryKey: ["anomalies"] });
      queryClient.invalidateQueries({ queryKey: ["anomaly-stats"] });
    },
  });

  const updateAnomalyStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: AnomalyStatus }): Promise<Anomaly> => {
      const response = await apiClient.patch<Anomaly>(`/anomaly/updateAnomalyStatus/${id}`, { status });
      return response.data;
    },
    onSuccess: (data, variables) => {
      // Update the specific anomaly in cache
      queryClient.setQueryData(["anomaly", variables.id], data);
      // Invalidate anomalies list and stats
      queryClient.invalidateQueries({ queryKey: ["anomalies"] });
      queryClient.invalidateQueries({ queryKey: ["anomaly-stats"] });
    },
  });

  const assignMaintenanceWindow = useMutation({
    mutationFn: async ({ id, windowId }: { id: string; windowId: string }): Promise<Anomaly> => {
      const response = await apiClient.patch<Anomaly>(`/anomaly/assignMaintenanceWindow/${id}`, { 
        maintenance_window_id: windowId 
      });
      return response.data;
    },
    onSuccess: (data, variables) => {
      // Update the specific anomaly in cache
      queryClient.setQueryData(["anomaly", variables.id], data);
      // Invalidate anomalies list
      queryClient.invalidateQueries({ queryKey: ["anomalies"] });
    },
  });

  const deleteAnomaly = useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await apiClient.delete(`/anomaly/deleteAnomaly/${id}`);
    },
    onSuccess: (_, id) => {
      // Remove the specific anomaly from cache
      queryClient.removeQueries({ queryKey: ["anomaly", id] });
      // Invalidate anomalies list and stats
      queryClient.invalidateQueries({ queryKey: ["anomalies"] });
      queryClient.invalidateQueries({ queryKey: ["anomaly-stats"] });
    },
  });

  const batchUpload = useMutation({
    mutationFn: async (file: File): Promise<{ success: number; errors: string[] }> => {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await apiClient.post<{ success: number; errors: string[] }>(
        '/anomaly/batchUpload', 
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    },
    onSuccess: () => {
      // Invalidate anomalies list and stats after batch upload
      queryClient.invalidateQueries({ queryKey: ["anomalies"] });
      queryClient.invalidateQueries({ queryKey: ["anomaly-stats"] });
    },
  });

  return {
    createAnomaly,
    updateAnomaly,
    updateAnomalyStatus,
    assignMaintenanceWindow,
    deleteAnomaly,
    batchUpload,
  };
}

export function useAnomalyStats(enabled: boolean = true) {
  return useQuery({
    queryKey: ["anomaly-stats"],
    queryFn: async () => {
      const { data } = await apiClient.get<AnomalyStatsResponse>('/anomaly/getAnomalyStats');
      return data;
    },
    enabled,
    staleTime: 2 * 60 * 1000, // 2 minutes (stats might need more frequent updates)
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
} 