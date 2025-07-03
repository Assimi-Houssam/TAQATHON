import { apiClient } from "@/lib/axios";
import { useMutation } from "@tanstack/react-query";

// Simplified to just a single search placeholder
export const SEARCH_PLACEHOLDER = "Search across all categories";

export type SearchResultType =
  | "user"
  | "company"
  | "pRequest"
  | "bid"
  | "report";

export interface SearchResult {
  id: string;
  title: string;
  description?: string;
  type: SearchResultType;
}

// Backend API types
interface SearchResponse {
  results: SearchResult[];
  total: number;
}

export function useSearch({
  onSuccess,
}: {
  onSuccess: (data: SearchResponse) => void;
}) {
  return useMutation({
    mutationFn: async ({
      query,
      currentPage,
    }: {
      query: string;
      currentPage: number;
    }) => {
      const params = new URLSearchParams({
        query,
        page: currentPage.toString(),
        limit: "4",
      });

      const response = await apiClient.get<SearchResponse>("/search", {
        params,
      });
      return response.data;
    },
    onSuccess: (data) => {
      onSuccess(data);
    },
  });
}
