import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Search, Filter, X, ChevronLeft, ChevronRight } from "lucide-react";
import { DataTableProps, FilterGroup, ColumnVisibilityState } from "./types";
import { ColumnVisibilityToggle } from "./core/ColumnVisibilityToggle";
import { TableLoading } from "./utils/TableLoading";
import { TableError } from "./utils/TableError";
import { TableEmpty } from "./utils/TableEmpty";

/**
 * Enhanced DataTable component with comprehensive features
 * 
 * Features:
 * - Search functionality
 * - Advanced filtering with dropdowns
 * - Column visibility controls
 * - Pagination
 * - Sorting
 * - Loading and error states
 * - Empty state handling
 * - Responsive design
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
  rowClassName,
  pagination,
}: DataTableProps<T>) {
  // Extract configuration with defaults
  const {
    enableSearch = config.searchable ?? true,
    enableSorting = config.sortable ?? true,
    enableFilters = config.filterable ?? true,
    enablePagination = config.paginated ?? true,
    enableColumnVisibility = config.columnVisibility ?? true,
    pageSize = config.pageSize ?? 10,
    searchPlaceholder = config.searchPlaceholder ?? "Search...",
    searchableColumns = config.searchableColumns ?? [],
    defaultColumnVisibility = config.defaultColumnVisibility ?? {},
    defaultSort = config.defaultSort,
  } = config;

  // Loading delay state management
  const [showLoading, setShowLoading] = useState(false);
  const [canShowResult, setCanShowResult] = useState(false);
  const loadingStartTimeRef = useRef<number | null>(null);
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Minimum loading display duration (in milliseconds)
  const MIN_LOADING_DURATION = 1500;

  // Handle loading state transitions with delay
  useEffect(() => {
    if (loading) {
      // Start loading
      setShowLoading(true);
      setCanShowResult(false);
      loadingStartTimeRef.current = Date.now();
      
      // Clear any existing timeout
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    } else {
      // Loading finished - check if minimum duration has passed
      if (loadingStartTimeRef.current) {
        const elapsedTime = Date.now() - loadingStartTimeRef.current;
        const remainingTime = Math.max(0, MIN_LOADING_DURATION - elapsedTime);
        
        if (remainingTime > 0) {
          // Still need to wait - set timeout for remaining time
          loadingTimeoutRef.current = setTimeout(() => {
            setShowLoading(false);
            setCanShowResult(true);
            loadingStartTimeRef.current = null;
          }, remainingTime);
        } else {
          // Minimum duration already passed
          setShowLoading(false);
          setCanShowResult(true);
          loadingStartTimeRef.current = null;
        }
      } else {
        // No loading start time recorded (shouldn't happen, but handle gracefully)
        setShowLoading(false);
        setCanShowResult(true);
      }
    }

    // Cleanup timeout on unmount or dependency change
    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    };
  }, [loading]);

  // Internal state
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(pagination?.currentPage || 1);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(
    defaultSort ? { key: String(defaultSort.field), direction: defaultSort.direction } : null
  );
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const [openDropdown, setOpenDropdown] = useState<'filter' | 'column' | null>(null);

  // Column visibility state management
  const [internalColumnVisibility, setInternalColumnVisibility] = useState<ColumnVisibilityState<T>>(() => {
    const initial: ColumnVisibilityState<T> = {};
    columns.forEach(column => {
      initial[column.id] = defaultColumnVisibility[column.id] ?? true;
    });
    return initial;
  });

  const columnVisibility = externalColumnVisibility || internalColumnVisibility;
  const handleColumnVisibilityChange = externalOnColumnVisibilityChange || setInternalColumnVisibility;

  // Filter columns based on visibility
  const visibleColumns = useMemo(() => {
    if (!enableColumnVisibility) return columns;
    
    return columns.filter(column => {
      return columnVisibility[column.id] !== false;
    });
  }, [columns, columnVisibility, enableColumnVisibility]);

  // Data processing with enhanced filtering
  const filteredData = useMemo(() => {
    let result = data;
    
    // Apply search filter
    if (enableSearch && searchTerm) {
      result = result.filter((item) => {
        const fieldsToSearch = searchableColumns.length > 0 ? searchableColumns : Object.keys(item);
        return fieldsToSearch.some((field) =>
          String(item[field as keyof T]).toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
    }
    
    // Apply custom filters
    if (enableFilters && Object.keys(activeFilters).length > 0) {
      result = result.filter((item) => {
        return Object.entries(activeFilters).every(([key, value]) => {
          if (!value) return true; // Skip empty filter values
          
          const itemValue = String(item[key as keyof T]);
          return itemValue === value;
        });
      });
    }
    
    return result;
  }, [data, searchTerm, enableSearch, searchableColumns, enableFilters, activeFilters]);

  // Sorting logic
  const sortedData = useMemo(() => {
    if (!enableSorting || !sortConfig) return filteredData;
    
    return [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.key as keyof T];
      const bValue = b[sortConfig.key as keyof T];
      
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortConfig, enableSorting]);

  // Pagination logic with consistent height - always render pageSize rows
  const paginatedData = useMemo((): (T | (T & { __isFakeRow: boolean }))[] => {
    if (!enablePagination) return sortedData;
    
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const pageData = sortedData.slice(startIndex, endIndex);
    
    // Always ensure exactly pageSize rows are rendered on every page
    const emptyRowsNeeded = pageSize - pageData.length;
    
    if (emptyRowsNeeded > 0 && pageData.length > 0) {
      // Create fake rows based on the structure of the first real row
      const templateRow = pageData[0];
      const fakeRows = Array(emptyRowsNeeded).fill(null).map((_, index) => {
        const fakeRow = { ...templateRow } as any;
        
        // Override with placeholder values
        Object.keys(fakeRow).forEach(key => {
          if (key === 'id') {
            fakeRow[key] = `fake-${startIndex + pageData.length + index}`;
          } else if (typeof fakeRow[key] === 'string') {
            fakeRow[key] = '';
          } else if (typeof fakeRow[key] === 'number') {
            fakeRow[key] = null;
          }
        });
        
        fakeRow.__isFakeRow = true;
        return fakeRow as T & { __isFakeRow: boolean };
      });
      
      return [...pageData, ...fakeRows];
    }
    
    return pageData;
  }, [sortedData, currentPage, pageSize, enablePagination]);

  const totalPages = pagination?.totalPages || Math.ceil(sortedData.length / pageSize);
  const totalCount = pagination?.total || sortedData.length;
  const actualCurrentPage = pagination?.currentPage || currentPage;

  // Event handlers
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleSort = (columnId: string) => {
    if (!enableSorting) return;
    
    setSortConfig(current => {
      if (current?.key === columnId) {
        return current.direction === 'asc' 
          ? { key: columnId, direction: 'desc' }
          : null;
      }
      return { key: columnId, direction: 'asc' };
    });
  };

  const handleFilterChange = (filterKey: string, value: string) => {
    setActiveFilters(prev => ({
      ...prev,
      [filterKey]: value
    }));
    setCurrentPage(1); // Reset to first page when filtering
  };

  const handleClearFilters = () => {
    setActiveFilters({});
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    if (pagination?.onPageChange) {
      pagination.onPageChange(page);
    } else {
      setCurrentPage(page);
    }
  };

  // Render loading state (with delay)
  if (showLoading) {
    return <TableLoading columns={columns.length} />;
  }

  // Only show error/empty states after loading delay has completed
  if (canShowResult) {
    // Render error state
    if (error) {
      return <TableError message={error.message || 'An error occurred'} />;
    }

    // Render empty state
    if (data.length === 0) {
      return <TableEmpty />;
    }
  }

  // If we're transitioning (not loading but not ready to show result), show loading
  if (!showLoading && !canShowResult) {
    return <TableLoading columns={columns.length} />;
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search and Filter Controls */}
      <div className="flex flex-col gap-4">
        <div className="flex gap-3 items-center">
          {/* Left side - Search */}
          <div className="flex items-center gap-2">
            {/* Search */}
            {enableSearch && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={searchPlaceholder}
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10 w-[300px] bg-white"
                />
              </div>
            )}
          </div>
          
          {/* Right side - Filter and Column Controls */}
          <div className="flex items-center gap-2">
            {/* Filter Dropdown */}
            {enableFilters && filters.length > 0 && (
              <DropdownMenu 
                open={openDropdown === 'filter'}
                onOpenChange={(open) => setOpenDropdown(open ? 'filter' : null)}
              >
                <DropdownMenuTrigger asChild>
                  <Button className="" variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                    {Object.keys(activeFilters).length >= 0 && (
                      <Badge variant="secondary" className="ml-2">
                        {Object.keys(activeFilters).length}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Filter by</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  
                  {filters.map((filterGroup) => (
                    <div key={filterGroup.key} className="p-2">
                      <p className="text-sm font-medium mb-2">{filterGroup.label}</p>
                      {filterGroup.options.map((option) => {
                        const isActive = activeFilters[filterGroup.key] === option.value;
                        const toggleFilter = () => {
                          if (isActive) {
                            handleFilterChange(filterGroup.key, "");
                          } else {
                            handleFilterChange(filterGroup.key, option.value);
                          }
                        };
                        
                        return (
                          <DropdownMenuItem
                            key={`${filterGroup.key}-${option.value}`}
                            onClick={(e) => {
                              e.preventDefault();
                              toggleFilter();
                            }}
                            className="cursor-pointer"
                          >
                            <div className="flex items-center w-full">
                              <Checkbox
                                id={`${filterGroup.key}-${option.value}`}
                                checked={isActive}
                                onCheckedChange={toggleFilter}
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
                open={openDropdown === 'column'}
                onOpenChange={(open) => setOpenDropdown(open ? 'column' : null)}
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
      <div className="bg-white rounded-lg border border-zinc-200 shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              {visibleColumns.map((column, index) => (
                <TableHead 
                  key={column.id}
                  className={`${column.enableSorting ? 'cursor-pointer hover:bg-muted/50' : ''}`}
                  onClick={() => column.enableSorting && handleSort(column.id)}
                  style={{ width: column.size ? `${column.size}px` : undefined }}
                >
                  <div className="flex items-center gap-2 justify-start">
                    {column.header}
                    {enableSorting && sortConfig?.key === column.id && (
                      <span className="text-xs">
                        {sortConfig.direction === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={visibleColumns.length} className="text-center py-8">
                  <div className="text-muted-foreground">
                    {searchTerm || Object.keys(activeFilters).length > 0 
                      ? "No results found. Try adjusting your search or filters."
                      : "No data available."
                    }
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((row, index) => {
                // Handle fake disabled rows
                const isFakeRow = row && typeof row === 'object' && '__isFakeRow' in row;
                
                return (
                  <TableRow 
                    key={isFakeRow ? `fake-row-${index}` : `row-${index}`}
                    className={`${!isFakeRow && onRowClick ? "cursor-pointer hover:bg-muted/50" : ""} ${!isFakeRow && rowClassName ? rowClassName(row as T) : ""} ${isFakeRow ? "opacity-30 pointer-events-none" : ""}`}
                    onClick={() => !isFakeRow && onRowClick?.(row as T)}
                  >
                    {visibleColumns.map((column) => (
                      <TableCell key={`${index}-${column.id}`}>
                        {column.cell ? (
                          column.cell({ row: { original: row as T } })
                        ) : (
                          <div>
                            {column.accessorKey ? String((row as T)[column.accessorKey]) : ''}
                          </div>
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {enablePagination && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {((actualCurrentPage - 1) * pageSize) + 1} to {Math.min(actualCurrentPage * pageSize, totalCount)} of {totalCount} results
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(actualCurrentPage - 1)}
              disabled={actualCurrentPage === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={actualCurrentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePageChange(page)}
                  className="w-8 h-8 p-0"
                >
                  {page}
                </Button>
              ))}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(actualCurrentPage + 1)}
              disabled={actualCurrentPage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
} 