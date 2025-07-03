import { apiClient } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import { Log, LogsType } from "@/types/entities/index";
import { AxiosError } from "axios";

interface LogsParams {
  page?: number;
  limit?: number;
  actionType?: LogsType;
  startDate?: string;
  endDate?: string;
  search?: string;
}

/**
 * Hook to fetch logs with optional filtering parameters
 * @param params Optional parameters for filtering logs
 * @param params.page Page number (default: 1)
 * @param params.limit Number of items per page (default: 10)
 * @param params.type Filter by log type
 * @param params.userId Filter by user ID
 * @param params.date Filter by date (ISO string format)
 * @returns Query result containing logs data
 *
 * @example
 * // Basic usage
 * const { data: logs, isLoading } = useGetLogs();
 *
 * // With filters
 * const { data: logs } = useGetLogs({
 *   limit: 20,
 *   type: 'UPDATE',
 *   userId: 123
 * });
 */
export function useGetLogs(params: LogsParams = {}) {
  const { page = 1, limit = 10, actionType, startDate, endDate, search } = params;

  return useQuery<
    {
      logs: Log[];
      total: number;
    },
    AxiosError
  >({
    queryKey: ["logs", page, limit, actionType, startDate, endDate, search],
    queryFn: async () => {
      const { data } = await apiClient.get("/logs", {
        params: {
          page,
          limit,
          actionType,
          startDate,
          endDate,
          search
        },
      });
      return {
        logs: data.logs,
        total: data.total,
      };
    },
    staleTime: 60_000, // 1 minute
    gcTime: 300_000, // 5 minutes
  });
}

/**
 * Hook to fetch a single log by ID
 * @param id Log ID
 * @returns Query result containing single log data
 *
 * @example
 * const { data: log, isLoading } = useGetLogById(123);
 */
export function useGetLogById(id: number) {
  return useQuery<Log, AxiosError>({
    queryKey: ["log", id],
    queryFn: async () => {
      const { data } = await apiClient.get(`/logs/${id}`);
      return data;
    },
    staleTime: 60_000,
    gcTime: 300_000,
  });
}

// Utility functions for client-side filtering if needed
export const filterLogsByDate = (logs: Log[], date: Date) =>
  logs.filter(
    (log) => new Date(log.created_at).toDateString() === date.toDateString()
  );

export const groupLogsByDate = (logs: Log[]) =>
  Object.entries(
    logs.reduce((acc, log) => {
      const date = new Date(log.created_at).toDateString();
      acc[date] = acc[date] || [];
      acc[date].push(log);
      return acc;
    }, {} as Record<string, Log[]>)
  ).sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime());
