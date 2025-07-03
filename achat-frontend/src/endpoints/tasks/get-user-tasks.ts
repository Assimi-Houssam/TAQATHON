// /api/tasks
import { apiClient } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import { Task } from "@/types/entities";
import { AxiosError } from "axios";

export type TasksError = {
  message: string;
  status: number;
};

export type TasksResponse = {
  data: Task[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export function useGetUserTasks(page = 1, limit = 4) {
  return useQuery<TasksResponse, TasksError>({
    queryKey: ["UserTasks", page, limit],
    queryFn: async () => {
      try {
        const { data } = await apiClient.get(`/tasks`, {
          params: {
            page,
            limit,
          },
        });
        return data;
      } catch (error: unknown) {
        throw {
          message:
            error instanceof AxiosError
              ? error.response?.data?.message || error.message
              : error instanceof Error
              ? error.message
              : "Failed to fetch tasks",
          status:
            error instanceof AxiosError ? error.response?.status || 500 : 500,
        };
      }
    },
    staleTime: 5 * 60 * 1000, // Consider data stale after 5 minutes
    gcTime: 30 * 60 * 1000, // Keep data in cache for 30 minutes
    retry: 2, // Retry failed requests twice
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });
}

// Utility functions
export const getCompletedTasks = (tasks: Task[]) =>
  tasks.filter((task) => task.completed);

export const getPendingTasks = (tasks: Task[]) =>
  tasks.filter((task) => !task.completed);

export const getTasksByDate = (tasks: Task[], date: Date) =>
  tasks.filter(
    (task) =>
      new Date(task.createdAt).toDateString() === date.toDateString()
  );
