import { useState, useEffect } from "react";
import { Search, Filter, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { SearchBarProps, FilterGroup } from "../types";

/**
 * SearchBar - Search and filter component for data tables
 * 
 * Features:
 * - Real-time search with debouncing
 * - Multi-select filters
 * - Active filter display
 * - Responsive design
 */
export function SearchBar({
  onSearch,
  placeholder = "Search...",
  filters = [],
  className,
}: SearchBarProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, onSearch]);

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
  };

  const clearAllFilters = () => {
    setActiveFilters({});
  };

  const hasActiveFilters = Object.keys(activeFilters).length > 0;

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
                    {Object.keys(activeFilters).length}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {filters.map((filterGroup) => (
                <div key={filterGroup.key} className="p-2">
                  <p className="text-sm font-medium mb-2">{filterGroup.label}</p>
                  {filterGroup.options.map((option) => (
                    <DropdownMenuItem
                      key={option.value}
                      onClick={() => handleFilterChange(filterGroup.key, option.value)}
                      className="cursor-pointer"
                    >
                      <div className="flex items-center w-full">
                        <span className="flex-1">{option.label}</span>
                        {activeFilters[filterGroup.key] === option.value && (
                          <div className="w-2 h-2 bg-primary rounded-full" />
                        )}
                      </div>
                    </DropdownMenuItem>
                  ))}
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
          {Object.entries(activeFilters).map(([key, value]) => {
            const filterGroup = filters.find(f => f.key === key);
            const option = filterGroup?.options.find(o => o.value === value);
            return (
              <Badge key={key} variant="secondary" className="gap-1">
                {option?.label || value}
                <X
                  className="h-3 w-3 cursor-pointer hover:text-destructive"
                  onClick={() => handleFilterChange(key, value)}
                />
              </Badge>
            );
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