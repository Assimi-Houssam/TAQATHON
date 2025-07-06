import { useState, useEffect } from "react";
import { Search, Filter, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { SearchBarProps, FilterGroup } from "../types";

/**
 * SearchBar - Search and filter component for data tables
 * 
 * Features:
 * - Real-time search with debouncing
 * - Multi-select filters with persistence
 * - Active filter display
 * - Responsive design
 * - Multiple filters can be applied simultaneously
 */
export function SearchBar({
  onSearch,
  placeholder = "Search...",
  filters = [],
  className,
  activeFilters = {},
  onFilterChange,
  onClearFilters,
}: SearchBarProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [localActiveFilters, setLocalActiveFilters] = useState<Record<string, string[]>>({}); // Changed to support multiple values
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  // Initialize local filters from props
  useEffect(() => {
    if (Object.keys(activeFilters).length > 0) {
      const converted = Object.entries(activeFilters).reduce((acc, [key, value]) => {
        acc[key] = [value];
        return acc;
      }, {} as Record<string, string[]>);
      setLocalActiveFilters(converted);
    }
  }, [activeFilters]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, onSearch]);

  const handleFilterChange = (filterKey: string, value: string, checked: boolean) => {
    setLocalActiveFilters(prev => {
      const updated = { ...prev };
      
      if (checked) {
        // Add the filter value
        updated[filterKey] = [...(updated[filterKey] || []), value];
      } else {
        // Remove the filter value
        updated[filterKey] = (updated[filterKey] || []).filter(v => v !== value);
        if (updated[filterKey].length === 0) {
          delete updated[filterKey];
        }
      }
      
      return updated;
    });

    // Notify parent component - use first value for backward compatibility
    if (onFilterChange) {
      if (checked) {
        onFilterChange(filterKey, value);
      } else {
        // If unchecking, we need to handle this differently
        // For now, we'll clear the filter if it matches the current value
        if (activeFilters[filterKey] === value) {
          onFilterChange(filterKey, "");
        }
      }
    }
  };

  const clearAllFilters = () => {
    setLocalActiveFilters({});
    if (onClearFilters) {
      onClearFilters();
    }
  };

  const hasActiveFilters = Object.keys(localActiveFilters).length > 0;
  const totalActiveFilters = Object.values(localActiveFilters).reduce((sum, values) => sum + values.length, 0);

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={placeholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        {filters.length > 0 && (
          <DropdownMenu open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filters
                {hasActiveFilters && (
                  <Badge variant="secondary" className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
                    {totalActiveFilters}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 max-h-96 overflow-y-auto">
              <DropdownMenuLabel>Filter Options</DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              {/* Clear all filters button */}
              {hasActiveFilters && (
                <>
                  <div className="p-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearAllFilters}
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
                    const isActive = (localActiveFilters[filterGroup.key] || []).includes(option.value);
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
                            onCheckedChange={(checked) => 
                              handleFilterChange(filterGroup.key, option.value, checked as boolean)
                            }
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
      </div>

      {/* Active filters display */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {Object.entries(localActiveFilters).map(([key, values]) => {
            const filterGroup = filters.find(f => f.key === key);
            return values.map(value => {
              const option = filterGroup?.options.find(o => o.value === value);
              return (
                <Badge key={`${key}-${value}`} variant="secondary" className="gap-1">
                  {filterGroup?.label}: {option?.label || value}
                  <X
                    className="h-3 w-3 cursor-pointer hover:text-destructive"
                    onClick={() => handleFilterChange(key, value, false)}
                  />
                </Badge>
              );
            });
          })}
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="h-6 px-2 text-xs"
          >
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
} 