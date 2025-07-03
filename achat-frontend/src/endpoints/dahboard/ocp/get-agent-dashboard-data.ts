import {
  AgentDashboardData,
  DashboardMetrics,
  DepartmentData,
} from "@/types/dashboard";
import { apiClient } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import { DateRange } from "react-day-picker";
import { toast } from "sonner";
import { AxiosError } from "axios";

// Helper function to format date for API
const formatDate = (date: Date | undefined) => {
  return date ? date.toISOString().split("T")[0] : undefined;
};

// Helper function to safely fetch data with fallback
const safeFetch = async (endpoint: string) => {
  try {
    const response = await apiClient.get(endpoint);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      toast.error(`Error fetching ${endpoint}: ${error.message}`);
    } else {
      toast.error(`Error fetching ${endpoint}`);
    }
    // console.error(`Error fetching ${endpoint}:`, error);
    return { total: 0, active: 0, closed: 0, won: 0, pending: 0, rejected: 0 };
  }
};

// Helper function to fetch and combine metrics data from multiple endpoints
const fetchMetricsData = async (): Promise<DashboardMetrics> => {
  const [companies, agents, suppliers, purchaseRequests, bids] =
    await Promise.allSettled([
      safeFetch("/companies"),
      safeFetch("/users/ocp/agents"),
      safeFetch("/users/ocp/suppliers"),
      safeFetch("/ocp/purchase-requests"),
      safeFetch("/ocp/bids"),
    ]);

  return {
    companies: {
      total: companies.status === "fulfilled" ? companies.value.total || 0 : 0,
      active:
        companies.status === "fulfilled" ? companies.value.active || 0 : 0,
    },
    agents: {
      total: agents.status === "fulfilled" ? agents.value.total || 0 : 0,
      active: agents.status === "fulfilled" ? agents.value.active || 0 : 0,
    },
    suppliers: {
      total: suppliers.status === "fulfilled" ? suppliers.value.total || 0 : 0,
      active:
        suppliers.status === "fulfilled" ? suppliers.value.active || 0 : 0,
    },
    bids: {
      total: bids.status === "fulfilled" ? bids.value.total || 0 : 0,
      closed: bids.status === "fulfilled" ? bids.value.closed || 0 : 0,
      won: bids.status === "fulfilled" ? bids.value.won || 0 : 0,
      pending: bids.status === "fulfilled" ? bids.value.pending || 0 : 0,
      rejected: bids.status === "fulfilled" ? bids.value.rejected || 0 : 0,
    },
    purchaseRequests: {
      closed:
        purchaseRequests.status === "fulfilled"
          ? purchaseRequests.value.closed || 0
          : 0,
      won:
        purchaseRequests.status === "fulfilled"
          ? purchaseRequests.value.won || 0
          : 0,
      pending:
        purchaseRequests.status === "fulfilled"
          ? purchaseRequests.value.pending || 0
          : 0,
      rejected:
        purchaseRequests.status === "fulfilled"
          ? purchaseRequests.value.rejected || 0
          : 0,
    },
  };
};

// Helper function to fetch departments data
const fetchDepartmentsData = async (dateRange: DateRange) => {
  try {
    const response = await apiClient.get("/departements", {
      params: {
        startDate: formatDate(dateRange.from),
        endDate: formatDate(dateRange.to),
      },
    });

    // Transform the response to match DepartmentData interface
    return response.data.map((dept: DepartmentData) => ({
      name: dept.name,
      percentage: dept.percentage || 0,
      requests: dept.requests || 0,
    }));
  } catch (error) {
    // console.error("Error fetching departments data:", error);
    if (error instanceof AxiosError) {
      toast.error(`Error fetching departments data: ${error.message}`);
    } else {
      toast.error("Error fetching departments data");
    }
    return []; // Return empty array on error
  }
};

// Main dashboard data fetching function
const fetchDashboardData = async (
  dateRange: DateRange
): Promise<AgentDashboardData> => {
  const [metrics, departments] = await Promise.allSettled([
    fetchMetricsData(),
    fetchDepartmentsData(dateRange),
  ]);

  return {
    metrics:
      metrics.status === "fulfilled"
        ? metrics.value
        : {
            companies: { total: 0, active: 0 },
            agents: { total: 0, active: 0 },
            suppliers: { total: 0, active: 0 },
            bids: { total: 0, closed: 0, won: 0, pending: 0, rejected: 0 },
            purchaseRequests: { closed: 0, won: 0, pending: 0, rejected: 0 },
          },
    departments: departments.status === "fulfilled" ? departments.value : [],
  };
};

// React Query hook for dashboard data
export function useAgentDashboardData(dateRange: DateRange) {
  return useQuery({
    queryKey: ["agent-dashboard", dateRange],
    queryFn: () => fetchDashboardData(dateRange),
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
    staleTime: 2 * 60 * 1000, // Consider data stale after 2 minutes
  });
}

// Individual data fetching hooks for more granular control
export function useMetricsData() {
  return useQuery({
    queryKey: ["dashboard-metrics"],
    queryFn: fetchMetricsData,
    staleTime: 5 * 60 * 1000,
  });
}

export function useDepartmentsData(dateRange: DateRange) {
  return useQuery({
    queryKey: ["dashboard-departments", dateRange],
    queryFn: () => fetchDepartmentsData(dateRange),
    staleTime: 5 * 60 * 1000,
  });
}
