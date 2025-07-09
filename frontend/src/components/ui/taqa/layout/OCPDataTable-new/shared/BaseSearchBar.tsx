import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useDebounce } from "use-debounce";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check } from "lucide-react";

export interface FilterOption {
  label: string;
  value: string;
}

export interface FilterGroup {
  label: string;
  options: FilterOption[];
  value: string | string[];
  onChange: (value: string | string[]) => void;
  isMulti?: boolean;
}

interface BaseSearchBarProps {
  onSearch: (term: string) => void;
  placeholder?: string;
  value?: string;
  debounceMs?: number;
  filters?: FilterGroup[];
  className?: string;
}

export function BaseSearchBar({
  onSearch,
  placeholder = "Search...",
  value = "",
  debounceMs = 300,
  filters = [],
  className,
}: BaseSearchBarProps) {
  const [searchTerm, setSearchTerm] = useState(value);
  const [debouncedValue] = useDebounce(searchTerm, debounceMs);

  useEffect(() => {
    onSearch(debouncedValue);
  }, [debouncedValue, onSearch]);

  useEffect(() => {
    setSearchTerm(value);
  }, [value]);

  const handleSearch = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setSearchTerm(event.target.value);
    },
    []
  );

  const clearSearch = useCallback(() => {
    setSearchTerm("");
  }, []);

  return (
    <div className={cn("flex flex-col md:flex-row gap-4", className)}>
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={handleSearch}
          className="pl-9 pr-9 h-10 min-w-[300px]"
        />
        {searchTerm && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      <div className="flex gap-2">
        {filters.map((filter) =>
          filter.isMulti ? (
            <Popover key={filter.label}>
              <PopoverTrigger asChild>
                <button className="flex h-10 w-[300px] items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                  <span className="truncate">
                    {Array.isArray(filter.value) && filter.value.length > 0
                      ? `${filter.value.length} selected`
                      : filter.label}
                  </span>
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-[300px] p-0" align="start">
                <Command>
                  <CommandInput placeholder={`Search ${filter.label}...`} />
                  <CommandEmpty>No results found.</CommandEmpty>
                  <CommandGroup>
                    {filter.options.map((option) => {
                      const isSelected = Array.isArray(filter.value) && filter.value.includes(option.value);
                      return (
                        <CommandItem
                          key={option.value}
                          onSelect={() => {
                            const newValue = Array.isArray(filter.value)
                              ? isSelected
                                ? filter.value.filter((v) => v !== option.value)
                                : [...filter.value, option.value]
                              : [option.value];
                            filter.onChange(newValue);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              isSelected ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {option.label}
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
          ) : (
            <Select
              key={filter.label}
              value={filter.value as string}
              onValueChange={filter.onChange as (value: string) => void}
            >
              <SelectTrigger className="w-[180px] h-10">
                <SelectValue placeholder={filter.label} />
              </SelectTrigger>
              <SelectContent>
                {filter.options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )
        )}
      </div>
    </div>
  );
}
