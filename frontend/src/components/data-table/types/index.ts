// Base column definition interface
export interface Column<T> {
  header: string;
  accessor: keyof T;
  width?: string;
  render?: (value: T[keyof T], item: T) => React.ReactNode;
  hidden?: boolean;
  clickable?: boolean;
  hideable?: boolean;
  defaultVisible?: boolean;
}

// Pagination state interface
export interface PaginationState {
  currentPage: number;
  totalPages: number;
  pageSize: number;
}

// Filter group interface for search functionality
export interface FilterGroup {
  key: string;
  label: string;
  options: FilterOption[];
}

export interface FilterOption {
  value: string;
  label: string;
}

// Sort configuration
export interface SortConfig<T> {
  field: keyof T;
  direction: "asc" | "desc";
}

// Base data table props
export interface BaseDataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  sortField?: keyof T;
  sortDirection?: "asc" | "desc";
  onSort?: (field: keyof T) => void;
  loading?: boolean;
  error?: Error | null;
  className?: string;
  onRowClick?: (row: T) => void;
}

// Unified data table props
export interface UnifiedDataTableProps<T> {
  columns: Column<T>[];
  queryResult: {
    data?: { users?: T[]; companies?: T[]; total?: number };
    isLoading: boolean;
    error: Error | null;
  };
  searchableFields: (keyof T)[];
  filters?: FilterGroup[];
  className?: string;
  onSearch?: (term: string) => void;
  page: number;
  onPageChange: (page: number) => void;
  limit: number;
}

// Search bar props
export interface SearchBarProps {
  onSearch: (term: string) => void;
  placeholder?: string;
  filters?: FilterGroup[];
  className?: string;
  activeFilters?: Record<string, string>;
  onFilterChange?: (filterKey: string, value: string) => void;
  onClearFilters?: () => void;
}

// Pagination props
export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

// Data table configuration
export interface DataTableConfig<T> {
  searchable?: boolean;
  sortable?: boolean;
  filterable?: boolean;
  paginated?: boolean;
  pageSize?: number;
  searchFields?: (keyof T)[];
  defaultSort?: SortConfig<T>;
  columnVisibility?: boolean;
  defaultHiddenColumns?: (keyof T)[];
}

// Column visibility state
export interface ColumnVisibilityState<T> {
  [key: string]: boolean;
}

// Enhanced data table props with column visibility
export interface DataTableProps<T extends Record<string, any>> {
  data: T[];
  columns: Column<T>[];
  config?: DataTableConfig<T>;
  className?: string;
  loading?: boolean;
  error?: Error | null;
  filters?: FilterGroup[];
  onRowClick?: (row: T) => void;
  columnVisibility?: ColumnVisibilityState<T>;
  onColumnVisibilityChange?: (columnVisibility: ColumnVisibilityState<T>) => void;
} 