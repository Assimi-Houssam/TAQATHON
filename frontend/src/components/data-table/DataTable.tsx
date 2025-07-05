import { useState, useMemo } from "react";
import { BaseDataTable } from "./core/BaseDataTable";
import { SearchBar } from "./core/SearchBar";
import { Pagination } from "./core/Pagination";
import { ColumnVisibilityToggle } from "./core/ColumnVisibilityToggle";
import { Column, FilterGroup, DataTableConfig, ColumnVisibilityState, DataTableProps } from "./types";
import { cn } from "@/lib/utils";
import { Search, Filter, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

/**
 * DataTable - Complete data table component with all features
 * 
 * Features:
 * - Search and filtering with multiple filter support
 * - Column visibility controls
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
  columnVisibility: externalColumnVisibility,
  onColumnVisibilityChange: externalOnColumnVisibilityChange,
}: DataTableProps<T>) {
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

  // Initialize column visibility state
  const [internalColumnVisibility, setInternalColumnVisibility] = useState<ColumnVisibilityState<T>>(() => {
    const initialState: ColumnVisibilityState<T> = {};
    
    // Set default visibility for all columns
    columns.forEach(column => {
      const key = column.accessor as string;
      initialState[key] = !defaultHiddenColumns.includes(column.accessor);
    });
    
    return initialState;
  });

  // Use external column visibility state if provided, otherwise use internal state
  const columnVisibility = externalColumnVisibility || internalColumnVisibility;
  const handleColumnVisibilityChange = externalOnColumnVisibilityChange || setInternalColumnVisibility;

  // State management
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<keyof T | undefined>(defaultSort?.field);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">(defaultSort?.direction || "asc");
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});

  // Filter columns based on visibility
  const visibleColumns = useMemo(() => {
    if (!enableColumnVisibility) return columns;
    
    return columns.filter(column => {
      const key = column.accessor as string;
      return columnVisibility[key] !== false;
    });
  }, [columns, columnVisibility, enableColumnVisibility]);

  // Data processing with enhanced filtering
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

  const handleClearFilters = () => {
    setActiveFilters({});
    setCurrentPage(1);
  };

  // Make columns sortable based on config
  const processedColumns = useMemo(() => {
    return visibleColumns.map(column => ({
      ...column,
      clickable: sortable && (column.clickable !== false),
    }));
  }, [visibleColumns, sortable]);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Top Controls */}
      <div className="flex flex-col gap-3">
        {/* Search Input and Action Buttons Row */}
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <div className="flex-1">
            {/* Search Input Only */}
            {searchable && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by ID, equipment, system, or description..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            )}
          </div>
          
          {/* Action Buttons Container */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Filter Button */}
            {filterable && filters.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                    {Object.keys(activeFilters).length > 0 && (
                      <Badge variant="secondary" className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
                        {Object.keys(activeFilters).length}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 max-h-96 overflow-y-auto">
                  <DropdownMenuLabel>Filter Options</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  
                  {/* Clear all filters button */}
                  {Object.keys(activeFilters).length > 0 && (
                    <>
                      <div className="p-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleClearFilters}
                          className="h-6 px-2 text-xs w-full"
                        >
                          Clear All Filters
                        </Button>
                      </div>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  
                  {filters.map((filterGroup) => (
                    <div key={filterGroup.key} className="p-2">
                      <p className="text-sm font-medium mb-2">{filterGroup.label}</p>
                      {filterGroup.options.map((option) => {
                        const isActive = activeFilters[filterGroup.key] === option.value;
                        return (
                          <DropdownMenuItem
                            key={option.value}
                            onClick={(e) => e.preventDefault()}
                            className="cursor-default"
                          >
                            <div className="flex items-center w-full">
                              <Checkbox
                                id={`${filterGroup.key}-${option.value}`}
                                checked={isActive}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    handleFilterChange(filterGroup.key, option.value);
                                  } else {
                                    handleFilterChange(filterGroup.key, "");
                                  }
                                }}
                                className="mr-2"
                              />
                              <label
                                htmlFor={`${filterGroup.key}-${option.value}`}
                                className="flex-1 cursor-pointer text-sm"
                              >
                                {option.label}
                              </label>
                            </div>
                          </DropdownMenuItem>
                        );
                      })}
                    </div>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            
            {/* Column Visibility Toggle */}
            {enableColumnVisibility && (
              <ColumnVisibilityToggle
                columns={columns}
                columnVisibility={columnVisibility}
                onColumnVisibilityChange={handleColumnVisibilityChange}
              />
            )}
          </div>
        </div>
        
        {/* Active Filters Display */}
        {Object.keys(activeFilters).length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-muted-foreground">Active filters:</span>
            {Object.entries(activeFilters).map(([key, value]) => {
              const filterGroup = filters.find(f => f.key === key);
              const option = filterGroup?.options.find(o => o.value === value);
              return (
                <Badge key={`${key}-${value}`} variant="secondary" className="gap-1">
                  {filterGroup?.label}: {option?.label || value}
                  <X
                    className="h-3 w-3 cursor-pointer hover:text-destructive"
                    onClick={() => handleFilterChange(key, "")}
                  />
                </Badge>
              );
            })}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              className="h-6 px-2 text-xs"
            >
              Clear all
            </Button>
          </div>
        )}
      </div>

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
        <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between text-xs text-zinc-500">
          <div>
            Showing {paginatedData.length} of {sortedData.length} results
            {searchTerm && ` for "${searchTerm}"`}
          </div>
          
          {/* Active filters summary */}
          {Object.keys(activeFilters).length > 0 && (
            <div className="flex items-center gap-1">
              <span>•</span>
              <span>{Object.keys(activeFilters).length} filter{Object.keys(activeFilters).length > 1 ? 's' : ''} active</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 