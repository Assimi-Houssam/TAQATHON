import { useState, useEffect } from 'react';
import { Anomaly, AnomalyFormData, AnomalyUpdateData, AnomalyStatus } from '@/types/anomaly';

// API endpoints - these would connect to your backend
const API_BASE = '/api/anomalies';

export interface UseAnomaliesOptions {
  status?: AnomalyStatus;
  criticality?: string;
  equipment?: string;
  limit?: number;
  offset?: number;
}

export function useAnomalies(options: UseAnomaliesOptions = {}) {
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnomalies = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const queryParams = new URLSearchParams();
      if (options.status) queryParams.append('status', options.status);
      if (options.criticality) queryParams.append('criticality', options.criticality);
      if (options.equipment) queryParams.append('equipment', options.equipment);
      if (options.limit) queryParams.append('limit', options.limit.toString());
      if (options.offset) queryParams.append('offset', options.offset.toString());

      const response = await fetch(`${API_BASE}?${queryParams}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch anomalies: ${response.statusText}`);
      }
      
      const data = await response.json();
      setAnomalies(data.anomalies || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnomalies();
  }, [options.status, options.criticality, options.equipment, options.limit, options.offset]);

  const refresh = () => {
    fetchAnomalies();
  };

  return {
    anomalies,
    loading,
    error,
    refresh
  };
}

export function useAnomaly(id: string) {
  const [anomaly, setAnomaly] = useState<Anomaly | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnomaly = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE}/${id}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch anomaly: ${response.statusText}`);
      }
      
      const data = await response.json();
      setAnomaly(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchAnomaly();
    }
  }, [id]);

  const refresh = () => {
    fetchAnomaly();
  };

  return {
    anomaly,
    loading,
    error,
    refresh
  };
}

export function useAnomalyMutations() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createAnomaly = async (data: AnomalyFormData): Promise<Anomaly> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(API_BASE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`Failed to create anomaly: ${response.statusText}`);
      }

      const anomaly = await response.json();
      return anomaly;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateAnomaly = async (id: string, data: AnomalyUpdateData): Promise<Anomaly> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE}/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`Failed to update anomaly: ${response.statusText}`);
      }

      const anomaly = await response.json();
      return anomaly;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateAnomalyStatus = async (id: string, status: AnomalyStatus): Promise<Anomaly> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE}/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update anomaly status: ${response.statusText}`);
      }

      const anomaly = await response.json();
      return anomaly;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const assignMaintenanceWindow = async (id: string, windowId: string): Promise<Anomaly> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE}/${id}/maintenance-window`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ maintenance_window_id: windowId }),
      });

      if (!response.ok) {
        throw new Error(`Failed to assign maintenance window: ${response.statusText}`);
      }

      const anomaly = await response.json();
      return anomaly;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteAnomaly = async (id: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE}/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Failed to delete anomaly: ${response.statusText}`);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const batchUpload = async (file: File): Promise<{ success: number; errors: string[] }> => {
    try {
      setLoading(true);
      setError(null);
      
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch(`${API_BASE}/batch-upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Failed to upload file: ${response.statusText}`);
      }

      const result = await response.json();
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    createAnomaly,
    updateAnomaly,
    updateAnomalyStatus,
    assignMaintenanceWindow,
    deleteAnomaly,
    batchUpload,
    loading,
    error
  };
}

export function useAnomalyStats() {
  const [stats, setStats] = useState({
    total: 0,
    by_status: {} as Record<AnomalyStatus, number>,
    by_criticality: {} as Record<string, number>,
    recent_count: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE}/stats`);
      if (!response.ok) {
        throw new Error(`Failed to fetch stats: ${response.statusText}`);
      }
      
      const data = await response.json();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const refresh = () => {
    fetchStats();
  };

  return {
    stats,
    loading,
    error,
    refresh
  };
} 