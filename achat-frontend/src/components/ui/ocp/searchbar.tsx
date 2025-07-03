"use client";

import { Input } from "@/components/ui/input";
import {
  SEARCH_PLACEHOLDER,
  SearchResult,
  useSearch,
} from "@/endpoints/search/search";
import debounce from "lodash/debounce";
import { Search } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import SearchResults from "./search-results";

const SearchBar = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isOpen, setIsOpen] = useState(false);
  const searchBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchBarRef.current &&
        !searchBarRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setResults([]);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const searchMutation = useSearch({
    onSuccess: (data) => {
      setResults(data.results);
      setTotal(data.total);
    },
  });

  const debouncedSearch = useCallback(
    (query: string, currentPage: number) => {
      searchMutation.mutate({ query, currentPage });
    },
    [searchMutation]
  );

  const debouncedSearchHandler = useMemo(
    () => debounce(debouncedSearch, 300),
    [debouncedSearch]
  );

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setPage(1);
    if (value.length >= 2) {
      setIsOpen(true);
      debouncedSearchHandler(value, 1);
    } else {
      setIsOpen(false);
      setResults([]);
    }
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    if (searchQuery.length >= 2) {
      debouncedSearchHandler(searchQuery, newPage);
    }
  };

  const handleResultClick = () => {
    setIsOpen(false);
    setSearchQuery("");
    setResults([]);
  };

  return (
    <div className="relative w-[32rem]">
      <div className="flex items-center border-2 border-custom-green-400 rounded-lg overflow-hidden">
        <Input
          className="py-4 border-none rounded-l-none border-l-0 h-10 shadow-none w-full focus-visible:ring-0 focus-visible:ring-transparent"
          placeholder={SEARCH_PLACEHOLDER}
          aria-label={SEARCH_PLACEHOLDER}
          onChange={(e) => handleSearchChange(e.target.value)}
          value={searchQuery}
        />
        <Search className="h-6 w-6 text-gray-500 mr-4" />
      </div>

      {isOpen && (results.length > 0 || searchMutation.isPending) && (
        <div
          ref={searchBarRef}
          className="absolute mt-1 w-full rounded-lg border bg-background shadow-lg"
        >
          <SearchResults
            isLoading={searchMutation.isPending}
            isError={searchMutation.isError}
            results={results}
            total={total}
            page={page}
            onPageChange={handlePageChange}
			onResultClick={handleResultClick}
          />
        </div>
      )}
    </div>
  );
};

export default SearchBar;
