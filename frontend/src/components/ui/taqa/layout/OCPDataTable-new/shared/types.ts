export interface PaginationState {
  currentPage: number;
  totalPages: number;
  pageSize: number;
}

export interface SortState<T> {
  field: keyof T;
  direction: "asc" | "desc";
}

export interface FilterState {
  searchTerm: string;
  filters: Record<string, unknown>;
}
