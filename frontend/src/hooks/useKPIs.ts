import { apiClient } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";

// KPI Data Interfaces
export interface ActionPlanKPI {
  action: {
    total: number;
    completed: number;
    inProgress: number;
  };
}

export interface ProcessingTimeKPI {
  averageHours: number;
  averageDays: number;
  totalAnomalies: number;
  minHours: number;
  maxHours: number;
  details: Array<{
    hours: number;
    days: number;
  }>;
}

export interface AnomaliesInProgressKPI {
  totalAnomalies: number;
  totalanomaliesinprogress: number;
  percentageWithDates: number;
}

export interface AnomaliesClosedKPI {
  totalAnomalies: number;
  totalanomaliesclosed: number;
  percentageWithDates: number;
}

export interface AnomaliesByCriticalityKPI {
  totalanomalihigh: number;
  totalanomalimedium: number;
  totalanomalilow: number;
  percentageHigh: number;
  percentageMedium: number;
  percentageLow: number;
}

export interface AnomaliesByStoppingRequirementKPI {
  total: number;
  requiringStop: number;
  notRequiringStop: number;
  percentageRequiringStop: number;
  percentageNotRequiringStop: number;
}

// Individual KPI Hooks
export function useActionPlanKPI(enabled: boolean = true) {
  return useQuery({
    queryKey: ["kpi", "actionplan"],
    queryFn: async () => {
      const { data } = await apiClient.get<ActionPlanKPI>('/kpi/actionplan');
      return data;
    },
    enabled,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}

export function useProcessingTimeKPI(enabled: boolean = true) {
  return useQuery({
    queryKey: ["kpi", "average-processing-time"],
    queryFn: async () => {
      const { data } = await apiClient.get<ProcessingTimeKPI>('/kpi/average-processing-time');
      return data;
    },
    enabled,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}

export function useAnomaliesInProgressKPI(enabled: boolean = true) {
  return useQuery({
    queryKey: ["kpi", "anomalies-in-progress"],
    queryFn: async () => {
      const { data } = await apiClient.get<AnomaliesInProgressKPI>('/kpi/getanomaliesinprogress');
      return data;
    },
    enabled,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}

export function useAnomaliesClosedKPI(enabled: boolean = true) {
  return useQuery({
    queryKey: ["kpi", "anomalies-closed"],
    queryFn: async () => {
      const { data } = await apiClient.get<AnomaliesClosedKPI>('/kpi/anomaliesclosed');
      return data;
    },
    enabled,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}

export function useAnomaliesByCriticalityKPI(enabled: boolean = true) {
  return useQuery({
    queryKey: ["kpi", "anomalies-by-criticality"],
    queryFn: async () => {
      const { data } = await apiClient.get<AnomaliesByCriticalityKPI>('/kpi/anomaliesByCriticality');
      return data;
    },
    enabled,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}

export function useAnomaliesByStoppingRequirementKPI(enabled: boolean = true) {
  return useQuery({
    queryKey: ["kpi", "anomalies-by-stopping-requirement"],
    queryFn: async () => {
      const { data } = await apiClient.get<AnomaliesByStoppingRequirementKPI>('/kpi/anomaliesByStoppingRequirement');
      return data;
    },
    enabled,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}

// Combined KPI Hook for convenience
export function useAllKPIs(enabled: boolean = true) {
  const actionPlan = useActionPlanKPI(enabled);
  const processingTime = useProcessingTimeKPI(enabled);
  const inProgress = useAnomaliesInProgressKPI(enabled);
  const closed = useAnomaliesClosedKPI(enabled);
  const criticality = useAnomaliesByCriticalityKPI(enabled);
  const stoppingRequirement = useAnomaliesByStoppingRequirementKPI(enabled);

  return {
    actionPlan,
    processingTime,
    inProgress,
    closed,
    criticality,
    stoppingRequirement,
    isLoading: actionPlan.isLoading || processingTime.isLoading || inProgress.isLoading || closed.isLoading || criticality.isLoading || stoppingRequirement.isLoading,
    isError: actionPlan.isError || processingTime.isError || inProgress.isError || closed.isError || criticality.isError || stoppingRequirement.isError,
  };
} 