import { useState, useMemo } from "react";
import { BaseDataTable } from "./core/BaseDataTable";
import { SearchBar } from "./core/SearchBar";
import { Pagination } from "./core/Pagination";
import { Column, FilterGroup, DataTableConfig } from "./types";
import { cn } from "@/lib/utils";

interface DataTableProps<T extends Record<string, any>> {
  data: T[];
  columns: Column<T>[];
  config?: DataTableConfig<T>;
  className?: string;
  loading?: boolean;
  error?: Error | null;
  filters?: FilterGroup[];
  onRowClick?: (row: T) => void;
}

/**
 * DataTable - Complete data table component with all features
 * 
 * Features:
 * - Search and filtering
 * - Sorting (client-side)
 * - Pagination
 * - Loading, error, and empty states
 * - Responsive design
 * - Animations
 * - Customizable configuration
 * 
 * @template T - The data type for table rows
 */
export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  config = {},
  className,
  loading = false,
  error = null,
  filters = [],
  onRowClick,
}: DataTableProps<T>) {
  const {
    searchable = true,
    sortable = true,
    filterable = true,
    paginated = true,
    pageSize = 10,
    searchFields = [],
    defaultSort,
  } = config;

  // State management
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<keyof T | undefined>(defaultSort?.field);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">(defaultSort?.direction || "asc");

  // Data processing
  const filteredData = useMemo(() => {
    if (!searchable || !searchTerm) return data;
    
    return data.filter((item) => {
      const fieldsToSearch = searchFields.length > 0 ? searchFields : Object.keys(item) as (keyof T)[];
      return fieldsToSearch.some((field) =>
        String(item[field]).toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  }, [data, searchTerm, searchable, searchFields]);

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

  // Event handlers
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    if (term !== searchTerm) {
      setCurrentPage(1); // Reset to first page only when search term actually changes
    }
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

  // Make columns sortable based on config
  const processedColumns = useMemo(() => {
    return columns.map(column => ({
      ...column,
      clickable: sortable && (column.clickable !== false),
    }));
  }, [columns, sortable]);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Search Bar */}
      {searchable && (
        <SearchBar
          onSearch={handleSearch}
          placeholder="Search by ID, equipment, system, or description..."
          filters={filterable ? filters : []}
          className="w-full"
        />
      )}

      {/* Data Table */}
      <div className="bg-white rounded-lg border border-zinc-200 overflow-hidden shadow-sm">
        <BaseDataTable
          data={paginatedData}
          columns={processedColumns}
          sortField={sortField}
          sortDirection={sortDirection}
          onSort={handleSort}
          loading={loading}
          error={error}
          className={className}
          onRowClick={onRowClick}
        />

        {/* Pagination */}
        {paginated && sortedData.length > 0 && (
          <div className="border-t border-zinc-200 px-4 py-2.5 bg-zinc-50/50">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>

      {/* Results summary */}
      {!loading && !error && (
        <div className="text-xs text-zinc-500">
          Showing {paginatedData.length} of {sortedData.length} results
          {searchTerm && ` for "${searchTerm}"`}
        </div>
      )}
    </div>
  );
} 