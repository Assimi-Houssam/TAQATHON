import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BaseDataTable } from "./core/BaseDataTable";
import { SearchBar } from "./core/SearchBar";
import { Pagination } from "./core/Pagination";
import { Column, FilterGroup, DataTableConfig } from "./types";
import { cn } from "@/lib/utils";

interface DataTableProps<T> {
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
export function DataTable<T>({
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

  // Make columns sortable based on config
  const processedColumns = useMemo(() => {
    return columns.map(column => ({
      ...column,
      clickable: sortable && (column.clickable !== false),
    }));
  }, [columns, sortable]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("space-y-4", className)}
    >
      {/* Search Bar */}
      {searchable && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <SearchBar
            onSearch={handleSearch}
            placeholder="Search..."
            filters={filterable ? filters : []}
            className="w-full"
          />
        </motion.div>
      )}

      {/* Data Table */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-card rounded-lg border shadow-sm overflow-hidden"
      >
        <BaseDataTable
          data={paginatedData}
          columns={processedColumns}
          sortField={sortField}
          sortDirection={sortDirection}
          onSort={handleSort}
          loading={loading}
          error={error}
          className={className}
        />

        {/* Pagination */}
        {paginated && sortedData.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="border-t p-4"
          >
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </motion.div>
        )}
      </motion.div>

      {/* Results summary */}
      {!loading && !error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-sm text-muted-foreground"
        >
          Showing {paginatedData.length} of {sortedData.length} results
          {searchTerm && ` for "${searchTerm}"`}
        </motion.div>
      )}
    </motion.div>
  );
} 