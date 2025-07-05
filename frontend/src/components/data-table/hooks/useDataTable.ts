import { useState, useMemo } from "react";
import { SortConfig, DataTableConfig } from "../types";

interface UseDataTableProps<T> {
  data: T[];
  config?: DataTableConfig<T>;
}

/**
 * Custom hook for data table state management
 * Handles search, sorting, pagination, and filtering logic
 */
export function useDataTable<T>({ data, config = {} }: UseDataTableProps<T>) {
  const {
    searchable = true,
    sortable = true,
    filterable = true,
    paginated = true,
    pageSize = 10,
    searchFields = [],
    defaultSort,
  } = config;

  // State
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<keyof T | undefined>(defaultSort?.field);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">(defaultSort?.direction || "asc");
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});

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
          return String(item[key as keyof T]) === value;
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
      } else if (aValue instanceof Date && bValue instanceof Date) {
        comparison = aValue.getTime() - bValue.getTime();
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
      if (updated[filterKey] === value) {
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
    
    // Config
    config: {
      searchable,
      sortable,
      filterable,
      paginated,
    },
  };
} 