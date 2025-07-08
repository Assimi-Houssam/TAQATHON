import { apiClient } from "@/lib/axios";
import { Anomaly, AnomalyFormData, AnomalyUpdateData, AnomalyStatus } from '@/types/anomaly';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";

export interface UseAnomaliesOptions {
  enabled?: boolean;
  page?: number;
  limit?: number;
  // Server-side filters
  status?: string;
  criticity?: string;
  section?: string;
  // Server-side sorting
  orderBy?: 'LOW' | 'HIGH';
}

export interface AnomaliesQueryParams {
  page?: number;
  limit?: number;
  status?: string;
  criticity?: string;
  section?: string;
  filter?: string; // This maps to orderBy in backend
}

interface AnomaliesResponse {
  data: Anomaly[];
  totalAnomaly?: number;
  totalPages?: number;
  currentPage?: number;
  hasNext?: boolean;
  hasPrevious?: boolean;
}

interface AnomalyStatsResponse {
  total: number;
  by_status: Record<AnomalyStatus, number>;
  by_criticality: Record<string, number>;
  recent_count: number;
}

export function useAnomalies(options: UseAnomaliesOptions = {}) {
  const { 
    enabled = true,
    page = 1,
    limit = 10,
    status,
    criticity,
    section,
    orderBy = 'HIGH'
  } = options;

  return useQuery({
    queryKey: ["anomalies", { page, limit, status, criticity, section, orderBy }],
    queryFn: async () => {
      // Build query parameters
      const params = new URLSearchParams();
      
      if (page) params.append('page', page.toString());
      if (limit) params.append('limit', limit.toString());
      if (status && status.trim() !== '') params.append('status', status);
      if (criticity && criticity.trim() !== '') params.append('criticity', criticity);
      if (section && section.trim() !== '') params.append('section', section);
      if (orderBy) params.append('filter', orderBy);

      const queryString = params.toString();
      const url = `/anomaly/getAnomaly${queryString ? `?${queryString}` : ''}`;
      
      const { data } = await apiClient.get<AnomaliesResponse>(url);
      
      return {
        anomalies: data.data || [],
        total: data.totalAnomaly || 0,
        totalPages: data.totalPages || 0,
        currentPage: data.currentPage || 1,
        hasNext: data.hasNext || false,
        hasPrevious: data.hasPrevious || false,
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

  const attachMaintenanceWindow = useMutation({
    mutationFn: async ({ anomalyId, maintenanceId }: { anomalyId: string; maintenanceId: string }): Promise<Anomaly> => {
      const response = await apiClient.patch<Anomaly>(`/anomaly/attach_mw/${anomalyId}/${maintenanceId}`);
      return response.data;
    },
    onSuccess: (data, variables) => {
      // Update the specific anomaly in cache
      queryClient.setQueryData(["anomaly", variables.anomalyId], data);
      // Invalidate anomalies list
      queryClient.invalidateQueries({ queryKey: ["anomalies"] });
    },
  });

  const uploadAttachment = useMutation({
    mutationFn: async ({ id, file }: { id: string; file: File }): Promise<any> => {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await apiClient.post(`/anomaly/attachment/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    },
    onSuccess: (_, variables) => {
      // Update the specific anomaly in cache
      queryClient.invalidateQueries({ queryKey: ["anomaly", variables.id] });
      // Invalidate anomalies list
      queryClient.invalidateQueries({ queryKey: ["anomalies"] });
    },
  });

  const createActionPlan = useMutation({
    mutationFn: async ({ anomalyId, actionPlan }: { anomalyId: string; actionPlan: any }): Promise<any> => {
      const response = await apiClient.post(`/anomaly/action_plan/${anomalyId}`, actionPlan);
      return response.data;
    },
    onSuccess: (_, variables) => {
      // Update the specific anomaly in cache
      queryClient.invalidateQueries({ queryKey: ["anomaly", variables.anomalyId] });
      // Invalidate anomalies list
      queryClient.invalidateQueries({ queryKey: ["anomalies"] });
    },
  });

  const createMaintenanceWindow = useMutation({
    mutationFn: async (file: File): Promise<any> => {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await apiClient.post('/anomaly/maintenance_window', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    },
    onSuccess: () => {
      // Invalidate anomalies list as maintenance windows might affect anomalies
      queryClient.invalidateQueries({ queryKey: ["anomalies"] });
      queryClient.invalidateQueries({ queryKey: ["maintenance-windows"] });
    },
  });

  const addMaintenanceWindow = useMutation({
    mutationFn: async (maintenanceWindowData: any): Promise<any> => {
      const response = await apiClient.post('/anomaly/adding_maintenance_window', maintenanceWindowData);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate anomalies list and maintenance windows
      queryClient.invalidateQueries({ queryKey: ["anomalies"] });
      queryClient.invalidateQueries({ queryKey: ["maintenance-windows"] });
    },
  });

  const markAsResolved = useMutation({
    mutationFn: async (id: string): Promise<Anomaly> => {
      const response = await apiClient.post<Anomaly>(`/anomaly/mark_as_resolved/${id}`);
      return response.data;
    },
    onSuccess: (data, id) => {
      // Update the specific anomaly in cache
      queryClient.setQueryData(["anomaly", id], data);
      // Invalidate anomalies list and stats
      queryClient.invalidateQueries({ queryKey: ["anomalies"] });
      queryClient.invalidateQueries({ queryKey: ["anomaly-stats"] });
    },
  });

  const markAsTreated = useMutation({
    mutationFn: async (id: string): Promise<Anomaly> => {
      const response = await apiClient.patch<Anomaly>(`/anomaly/traited/${id}`);
      return response.data;
    },
    onSuccess: (data, id) => {
      // Update the specific anomaly in cache
      queryClient.setQueryData(["anomaly", id], data);
      // Invalidate anomalies list and stats
      queryClient.invalidateQueries({ queryKey: ["anomalies"] });
      queryClient.invalidateQueries({ queryKey: ["anomaly-stats"] });
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
        '/ml/uploadanomalies', 
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
    attachMaintenanceWindow,
    uploadAttachment,
    createActionPlan,
    createMaintenanceWindow,
    addMaintenanceWindow,
    markAsResolved,
    markAsTreated,
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