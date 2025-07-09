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

interface RexData {
  summary?: string;
  file?: File;
  [key: string]: any;
}

/**
 * Hook to fetch all anomalies with pagination and filtering
 */
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

/**
 * Hook to fetch a single anomaly by ID
 */
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

/**
 * Hook providing all anomaly mutation operations
 */
export function useAnomalyMutations() {
  const queryClient = useQueryClient();

  /**
   * Create a new anomaly
   */
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
    onError: (error) => {
      console.error("Failed to create anomaly:", error);
    },
  });

  /**
   * Update an existing anomaly
   */
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
    onError: (error, variables) => {
      console.error(`Failed to update anomaly ${variables.id}:`, error);
    },
  });

  /**
   * Update anomaly status directly
   */
  const updateAnomalyStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: AnomalyStatus }): Promise<Anomaly> => {
      const response = await apiClient.patch<Anomaly>(`/anomaly/updateAnomaly/${id}`, { status });
      return response.data;
    },
    onSuccess: (data, variables) => {
      // Update the specific anomaly in cache
      queryClient.setQueryData(["anomaly", variables.id], data);
      // Invalidate anomalies list and stats
      queryClient.invalidateQueries({ queryKey: ["anomalies"] });
      queryClient.invalidateQueries({ queryKey: ["anomaly-stats"] });
    },
    onError: (error, variables) => {
      console.error(`Failed to update anomaly status for ${variables.id}:`, error);
    },
  });

  /**
   * Mark anomaly as treated (NEW → IN_PROGRESS)
   */
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
    onError: (error, id) => {
      console.error(`Failed to mark anomaly ${id} as treated:`, error);
    },
  });

  /**
   * Mark anomaly as resolved (IN_PROGRESS → CLOSED)
   */
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
    onError: (error, id) => {
      console.error(`Failed to mark anomaly ${id} as resolved:`, error);
    },
  });

  /**
   * Upload attachment for an anomaly
   */
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
    onError: (error, variables) => {
      console.error(`Failed to upload attachment for anomaly ${variables.id}:`, error);
    },
  });

  /**
   * Download attachment file
   */
  const downloadAttachment = useMutation({
    mutationFn: async (attachmentId: string): Promise<Blob> => {
      const response = await apiClient.get(`/anomaly/download-attachment/${attachmentId}`, {
        responseType: 'blob',
      });
      return response.data;
    },
    onError: (error, attachmentId) => {
      console.error(`Failed to download attachment ${attachmentId}:`, error);
    },
  });

  /**
   * Delete attachment
   */
  const deleteAttachment = useMutation({
    mutationFn: async ({ attachmentId, anomalyId }: { attachmentId: string; anomalyId: string }): Promise<void> => {
      await apiClient.delete(`/anomaly/deleteattachment/${attachmentId}`);
    },
    onSuccess: (_, variables) => {
      // Update the specific anomaly in cache
      queryClient.invalidateQueries({ queryKey: ["anomaly", variables.anomalyId] });
      // Invalidate anomalies list
      queryClient.invalidateQueries({ queryKey: ["anomalies"] });
    },
    onError: (error, variables) => {
      console.error(`Failed to delete attachment ${variables.attachmentId}:`, error);
    },
  });

  /**
   * Create action plan for an anomaly
   */
  const createActionPlan = useMutation({
    mutationFn: async ({ anomalyId, actionPlan }: { anomalyId: string; actionPlan: any }): Promise<any> => {
      const response = await apiClient.post(`/anomaly/action_plan/${anomalyId}`, actionPlan);
      return response.data;
    },
    onSuccess: (_, variables) => {
      // Update the specific anomaly in cache
      queryClient.invalidateQueries({ queryKey: ["anomaly", variables.anomalyId] });
      // Invalidate anomalies list and action plans
      queryClient.invalidateQueries({ queryKey: ["anomalies"] });
      queryClient.invalidateQueries({ queryKey: ["action-plans", variables.anomalyId] });
    },
    onError: (error, variables) => {
      console.error(`Failed to create action plan for anomaly ${variables.anomalyId}:`, error);
    },
  });

  /**
   * Attach REX (Return of Experience) entry to anomaly
   */
  const attachRex = useMutation({
    mutationFn: async ({ id, rexData }: { id: string; rexData: RexData }): Promise<any> => {
      // Validate that either summary or file is provided
      if (!rexData.summary?.trim() && !rexData.file) {
        throw new Error('Either summary or file must be provided');
      }

      const formData = new FormData();
      
      if (rexData.summary?.trim()) {
        formData.append('summary', rexData.summary.trim());
      }
      
      if (rexData.file) {
        formData.append('file', rexData.file);
      }
      
      const response = await apiClient.post(`/anomaly/rex/${id}`, formData, {
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
    onError: (error, variables) => {
      console.error(`Failed to attach REX to anomaly ${variables.id}:`, error);
      throw error; // Re-throw to allow component error handling
    },
  });

  /**
   * Create maintenance window from Excel file
   */
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
    onError: (error) => {
      console.error("Failed to create maintenance window from file:", error);
    },
  });

  /**
   * Add maintenance window manually
   */
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
    onError: (error) => {
      console.error("Failed to add maintenance window:", error);
    },
  });

  /**
   * Attach maintenance window to anomaly
   */
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
      queryClient.invalidateQueries({ queryKey: ["maintenance-windows"] });
    },
    onError: (error, variables) => {
      console.error(`Failed to attach maintenance window ${variables.maintenanceId} to anomaly ${variables.anomalyId}:`, error);
    },
  });

  /**
   * Delete an anomaly
   */
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
    onError: (error, id) => {
      console.error(`Failed to delete anomaly ${id}:`, error);
    },
  });

  /**
   * Batch upload anomalies from file
   */
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
    onError: (error) => {
      console.error("Failed to batch upload anomalies:", error);
    },
  });

  return {
    // Core CRUD operations
    createAnomaly,
    updateAnomaly,
    updateAnomalyStatus,
    deleteAnomaly,
    
    // Status transitions
    markAsTreated,
    markAsResolved,
    
    // Attachments and documentation
    uploadAttachment,
    downloadAttachment,
    deleteAttachment,
    attachRex,
    
    // Action plans
    createActionPlan,
    
    // Maintenance windows
    createMaintenanceWindow,
    addMaintenanceWindow,
    attachMaintenanceWindow,
    
    // Batch operations
    batchUpload,
  };
}

/**
 * Hook to fetch anomaly statistics
 */
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