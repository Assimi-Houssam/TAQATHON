import { useState, useMemo } from "react";
import { SortConfig, DataTableConfig, ColumnVisibilityState } from "../types";

interface UseDataTableProps<T> {
  data: T[];
  config?: DataTableConfig<T>;
  columns?: { accessor: keyof T; hideable?: boolean }[];
}

/**
 * Custom hook for data table state management
 * Handles search, sorting, pagination, filtering, and column visibility logic
 */
export function useDataTable<T>({ data, config = {}, columns = [] }: UseDataTableProps<T>) {
  const {
    searchable = true,
    sortable = true,
    filterable = true,
    paginated = true,
    pageSize = 10,
    searchFields = [],
    defaultSort,
    columnVisibility: enableColumnVisibility = true,
    defaultHiddenColumns = [],
  } = config;

  // State
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<keyof T | undefined>(defaultSort?.field);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">(defaultSort?.direction || "asc");
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  
  // Column visibility state
  const [columnVisibility, setColumnVisibility] = useState<ColumnVisibilityState<T>>(() => {
    const initialState: ColumnVisibilityState<T> = {};
    
    // Set default visibility for all columns
    columns.forEach(column => {
      const key = column.accessor as string;
      initialState[key] = !defaultHiddenColumns.includes(column.accessor);
    });
    
    return initialState;
  });

  // Data processing
  const filteredData = useMemo(() => {
    let result = data;

    // Apply search filter
    if (searchable && searchTerm) {
      result = result.filter((item) => {
        const fieldsToSearch = searchFields.length > 0 ? searchFields : Object.keys(item) as (keyof T)[];
        return fieldsToSearch.some((field) =>
          String(item[field]).toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
    }

    // Apply custom filters
    if (filterable && Object.keys(activeFilters).length > 0) {
      result = result.filter((item) => {
        return Object.entries(activeFilters).every(([key, value]) => {
          if (!value) return true; // Skip empty filter values
          
          const itemValue = String(item[key as keyof T]);
          return itemValue === value;
        });
      });
    }

    return result;
  }, [data, searchTerm, searchable, searchFields, filterable, activeFilters]);

  const sortedData = useMemo(() => {
    if (!sortable || !sortField) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];

      if (aValue === bValue) return 0;
      
      let comparison = 0;
      if (typeof aValue === "string" && typeof bValue === "string") {
        comparison = aValue.localeCompare(bValue);
      } else if (typeof aValue === "number" && typeof bValue === "number") {
        comparison = aValue - bValue;
      } else if (aValue && bValue && typeof aValue === "object" && typeof bValue === "object" && 
                 "getTime" in aValue && "getTime" in bValue) {
        comparison = (aValue as Date).getTime() - (bValue as Date).getTime();
      } else {
        comparison = String(aValue).localeCompare(String(bValue));
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [filteredData, sortField, sortDirection, sortable]);

  const paginatedData = useMemo(() => {
    if (!paginated) return sortedData;
    
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return sortedData.slice(startIndex, endIndex);
  }, [sortedData, currentPage, pageSize, paginated]);

  const totalPages = Math.ceil(sortedData.length / pageSize);

  // Actions
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleSort = (field: keyof T) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleFilterChange = (filterKey: string, value: string) => {
    setActiveFilters(prev => {
      const updated = { ...prev };
      if (!value || updated[filterKey] === value) {
        delete updated[filterKey];
      } else {
        updated[filterKey] = value;
      }
      return updated;
    });
    setCurrentPage(1); // Reset to first page when filtering
  };

  const clearAllFilters = () => {
    setActiveFilters({});
    setCurrentPage(1);
  };

  const resetSearch = () => {
    setSearchTerm("");
    setCurrentPage(1);
  };

  const resetPagination = () => {
    setCurrentPage(1);
  };

  const resetSort = () => {
    setSortField(defaultSort?.field);
    setSortDirection(defaultSort?.direction || "asc");
  };

  const resetAll = () => {
    setSearchTerm("");
    setCurrentPage(1);
    setActiveFilters({});
    setSortField(defaultSort?.field);
    setSortDirection(defaultSort?.direction || "asc");
  };

  // Column visibility actions
  const handleColumnVisibilityChange = (newColumnVisibility: ColumnVisibilityState<T>) => {
    setColumnVisibility(newColumnVisibility);
  };

  const showAllColumns = () => {
    const newVisibility = { ...columnVisibility };
    columns.forEach(column => {
      if (column.hideable !== false) {
        newVisibility[column.accessor as string] = true;
      }
    });
    setColumnVisibility(newVisibility);
  };

  const hideAllColumns = () => {
    const newVisibility = { ...columnVisibility };
    columns.forEach(column => {
      if (column.hideable !== false) {
        newVisibility[column.accessor as string] = false;
      }
    });
    setColumnVisibility(newVisibility);
  };

  return {
    // Data
    data: paginatedData,
    filteredData,
    sortedData,
    totalItems: sortedData.length,
    
    // Pagination
    currentPage,
    totalPages,
    pageSize,
    
    // Search
    searchTerm,
    
    // Sort
    sortField,
    sortDirection,
    
    // Filters
    activeFilters,
    
    // Column visibility
    columnVisibility,
    
    // Actions
    handleSearch,
    handleSort,
    handlePageChange,
    handleFilterChange,
    clearAllFilters,
    resetSearch,
    resetPagination,
    resetSort,
    resetAll,
    
    // Column visibility actions
    handleColumnVisibilityChange,
    showAllColumns,
    hideAllColumns,
    
    // Config
    config: {
      searchable,
      sortable,
      filterable,
      paginated,
      columnVisibility: enableColumnVisibility,
    },
  };
} 