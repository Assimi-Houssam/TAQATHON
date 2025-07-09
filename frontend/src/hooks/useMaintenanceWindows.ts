import { apiClient } from "@/lib/axios";
import { MaintenanceWindow } from '@/types/anomaly';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";

export interface UseMaintenanceWindowsOptions {
  enabled?: boolean;
  page?: number;
  limit?: number;
  // Server-side filters
  status?: string;
  equipment?: string;
  // Server-side sorting
  orderBy?: 'scheduled_start' | 'scheduled_end';
}

export interface MaintenanceWindowsQueryParams {
  page?: number;
  limit?: number;
  status?: string;
  equipment?: string;
  orderBy?: string;
}

interface MaintenanceWindowsResponse {
  data: MaintenanceWindow[];
  totalWindows?: number;
  totalPages?: number;
  currentPage?: number;
  hasNext?: boolean;
  hasPrevious?: boolean;
}

interface MaintenanceWindowFormData {
  date_debut_arret: string;
  date_fin_arret: string;
  titlte: string; // Note: typo maintained as per backend requirement
  duree_jour: string;
  duree_heure: string;
}

interface MaintenanceWindowUpdateData {
  scheduled_start?: string;
  scheduled_end?: string;
  assigned_team?: string;
  notes?: string;
  duration_of_intervention?: number;
  requires_stopping?: boolean;
}

/**
 * Hook to fetch all maintenance windows with pagination and filtering
 */
export function useMaintenanceWindows(options: UseMaintenanceWindowsOptions = {}) {
  const { 
    enabled = true,
    page = 1,
    limit = 10,
    status,
    equipment,
    orderBy = 'scheduled_start'
  } = options;

  return useQuery({
    queryKey: ["maintenance-windows", { page, limit, status, equipment, orderBy }],
    queryFn: async () => {
      // Build query parameters
      const params = new URLSearchParams();
      
      if (page) params.append('page', page.toString());
      if (limit) params.append('limit', limit.toString());
      if (status && status.trim() !== '') params.append('status', status);
      if (equipment && equipment.trim() !== '') params.append('equipment', equipment);
      if (orderBy) params.append('orderBy', orderBy);

      // Note: Using backend endpoint as provided - GET /anomaly/getmaintenancewondow
      const queryString = params.toString();
      const url = `/anomaly/getmaintenancewondow${queryString ? `?${queryString}` : ''}`;
      
      // API returns direct array of maintenance windows
      const { data } = await apiClient.get<MaintenanceWindow[]>(url);
      
      return {
        maintenanceWindows: data || [],
        total: data?.length || 0,
        totalPages: 1, // Since we're getting all data at once
        currentPage: 1,
        hasNext: false,
        hasPrevious: false,
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
 * Hook to fetch a single maintenance window by ID
 */
export function useMaintenanceWindow(id: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ["maintenance-window", id],
    queryFn: async () => {
      // Note: Using the backend endpoint as provided (getmaintenancewondow appears to be the actual endpoint name)
      const { data } = await apiClient.get<MaintenanceWindow>(`/anomaly/getmaintenancewondow/${id}`);
      return data;
    },
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}

/**
 * Hook providing all maintenance window mutation operations
 */
export function useMaintenanceWindowMutations() {
  const queryClient = useQueryClient();

  /**
   * Create maintenance window from Excel file
   */
  const createMaintenanceWindowFromFile = useMutation({
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
      // Invalidate maintenance windows list
      queryClient.invalidateQueries({ queryKey: ["maintenance-windows"] });
      queryClient.invalidateQueries({ queryKey: ["anomalies"] });
    },
    onError: (error) => {
      console.error("Failed to create maintenance window from file:", error);
    },
  });

  /**
   * Add maintenance window manually
   */
  const createMaintenanceWindow = useMutation({
    mutationFn: async (maintenanceWindowData: MaintenanceWindowFormData): Promise<MaintenanceWindow> => {
      const response = await apiClient.post<MaintenanceWindow>('/anomaly/adding_maintenance_window', maintenanceWindowData);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate maintenance windows list
      queryClient.invalidateQueries({ queryKey: ["maintenance-windows"] });
      queryClient.invalidateQueries({ queryKey: ["anomalies"] });
    },
    onError: (error) => {
      console.error("Failed to create maintenance window:", error);
    },
  });

  /**
   * Update an existing maintenance window
   */
  const updateMaintenanceWindow = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: MaintenanceWindowUpdateData }): Promise<MaintenanceWindow> => {
      const response = await apiClient.patch<MaintenanceWindow>(`/anomaly/updateMaintenanceWindow/${id}`, data);
      return response.data;
    },
    onSuccess: (data, variables) => {
      // Update the specific maintenance window in cache
      queryClient.setQueryData(["maintenance-window", variables.id], data);
      // Invalidate maintenance windows list
      queryClient.invalidateQueries({ queryKey: ["maintenance-windows"] });
      queryClient.invalidateQueries({ queryKey: ["anomalies"] });
    },
    onError: (error, variables) => {
      console.error(`Failed to update maintenance window ${variables.id}:`, error);
    },
  });

  /**
   * Delete a maintenance window
   */
  const deleteMaintenanceWindow = useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await apiClient.delete(`/anomaly/deletemaintenance/${id}`);
    },
    onSuccess: (_, id) => {
      // Remove the specific maintenance window from cache
      queryClient.removeQueries({ queryKey: ["maintenance-window", id] });
      // Invalidate maintenance windows list
      queryClient.invalidateQueries({ queryKey: ["maintenance-windows"] });
      queryClient.invalidateQueries({ queryKey: ["anomalies"] });
    },
    onError: (error, id) => {
      console.error(`Failed to delete maintenance window ${id}:`, error);
    },
  });

  /**
   * Attach maintenance window to anomaly
   */
  const attachMaintenanceWindowToAnomaly = useMutation({
    mutationFn: async ({ anomalyId, maintenanceId }: { anomalyId: string; maintenanceId: string }): Promise<any> => {
      const response = await apiClient.patch(`/anomaly/attach_mw/${anomalyId}/${maintenanceId}`);
      return response.data;
    },
    onSuccess: (_, variables) => {
      // Invalidate both anomalies and maintenance windows
      queryClient.invalidateQueries({ queryKey: ["anomaly", variables.anomalyId] });
      queryClient.invalidateQueries({ queryKey: ["anomalies"] });
      queryClient.invalidateQueries({ queryKey: ["maintenance-windows"] });
      queryClient.invalidateQueries({ queryKey: ["maintenance-window", variables.maintenanceId] });
    },
    onError: (error, variables) => {
      console.error(`Failed to attach maintenance window ${variables.maintenanceId} to anomaly ${variables.anomalyId}:`, error);
    },
  });

  /**
   * Detach maintenance window from anomaly
   */
  const detachMaintenanceWindowFromAnomaly = useMutation({
    mutationFn: async ({ anomalyId, maintenanceId }: { anomalyId: string; maintenanceId: string }): Promise<any> => {
      const response = await apiClient.patch(`/anomaly/detach_mw/${anomalyId}/${maintenanceId}`);
      return response.data;
    },
    onSuccess: (_, variables) => {
      // Invalidate both anomalies and maintenance windows
      queryClient.invalidateQueries({ queryKey: ["anomaly", variables.anomalyId] });
      queryClient.invalidateQueries({ queryKey: ["anomalies"] });
      queryClient.invalidateQueries({ queryKey: ["maintenance-windows"] });
      queryClient.invalidateQueries({ queryKey: ["maintenance-window", variables.maintenanceId] });
    },
    onError: (error, variables) => {
      console.error(`Failed to detach maintenance window ${variables.maintenanceId} from anomaly ${variables.anomalyId}:`, error);
    },
  });

  /**
   * Get maintenance windows for a specific anomaly
   */
  const getMaintenanceWindowsForAnomaly = useMutation({
    mutationFn: async (anomalyId: string): Promise<MaintenanceWindow[]> => {
      // Note: Assuming consistent endpoint naming pattern
      const response = await apiClient.get<MaintenanceWindow[]>(`/anomaly/getmaintenancewondowforanomaly/${anomalyId}`);
      return response.data;
    },
    onError: (error, anomalyId) => {
      console.error(`Failed to get maintenance windows for anomaly ${anomalyId}:`, error);
    },
  });

  /**
   * Get anomalies assigned to a specific maintenance window
   */
  const getAnomaliesForMaintenanceWindow = useMutation({
    mutationFn: async (maintenanceWindowId: string): Promise<any[]> => {
      // Note: Assuming consistent endpoint naming pattern
      const response = await apiClient.get(`/anomaly/getanomaliesformaintenancewondow/${maintenanceWindowId}`);
      return response.data;
    },
    onError: (error, maintenanceWindowId) => {
      console.error(`Failed to get anomalies for maintenance window ${maintenanceWindowId}:`, error);
    },
  });

  return {
    // Core CRUD operations
    createMaintenanceWindow,
    createMaintenanceWindowFromFile,
    updateMaintenanceWindow,
    deleteMaintenanceWindow,
    
    // Attachment operations
    attachMaintenanceWindowToAnomaly,
    detachMaintenanceWindowFromAnomaly,
    
    // Relationship queries
    getMaintenanceWindowsForAnomaly,
    getAnomaliesForMaintenanceWindow,
  };
}

/**
 * Hook to fetch maintenance window statistics
 */
export function useMaintenanceWindowStats(enabled: boolean = true) {
  return useQuery({
    queryKey: ["maintenance-window-stats"],
    queryFn: async () => {
      // Note: Assuming consistent endpoint naming pattern
      const { data } = await apiClient.get('/anomaly/getmaintenancewondowstats');
      return data;
    },
    enabled,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}

/**
 * Hook to fetch upcoming maintenance windows
 */
export function useUpcomingMaintenanceWindows(enabled: boolean = true) {
  return useQuery({
    queryKey: ["upcoming-maintenance-windows"],
    queryFn: async () => {
      // Note: Assuming consistent endpoint naming pattern
      const { data } = await apiClient.get('/anomaly/getupcomingmaintenancewondow');
      return data;
    },
    enabled,
    staleTime: 1 * 60 * 1000, // 1 minute for more frequent updates
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
} 