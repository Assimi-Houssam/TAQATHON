"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { SearchResult } from "@/endpoints/search/search";
import { useIsomorphicLayoutEffect } from "@/hooks/useIsomorphicLayoutEffect";
import { useKeyboardShortcut } from "@/hooks/useKeyboardShortcut";
import { cn } from "@/lib/utils";
import {
  AlertCircle,
  ArrowUpRight,
  Building2,
  ChevronLeft,
  ChevronRight,
  Clock,
  FileText,
  Handshake,
  KeyboardIcon,
  Scroll,
  Loader2,
  Search,
  User,
} from "lucide-react";
import Link from "next/link";
import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import { ErrorBoundary } from "react-error-boundary";

interface SearchResultsProps {
  isLoading: boolean;
  isError: boolean;
  results: SearchResult[];
  total: number;
  page: number;
  onPageChange: (page: number) => void;
  onResultClick: () => void;
}

const ITEMS_PER_PAGE = 4;

const RESULT_PATHS = {
  user: "/dashboard/profile",
  company: "/dashboard/suppliers",
  pRequest: "/dashboard/purchase-request",
  bid: "/dashboard/bids",
  report: "/dashboard/reports",
} as const;

const RESULT_ICONS = {
  user: User,
  company: Building2,
  pRequest: Scroll,
  bid: Handshake,
  report: FileText,
} as const;

function getResultUrl(result: SearchResult): string {
  const basePath = RESULT_PATHS[result.type];
  return `${basePath}/${result.id}`;
}

const ErrorFallback = memo(
  ({
    error,
    resetErrorBoundary,
  }: {
    error: Error;
    resetErrorBoundary: () => void;
  }) => (
    <div className="p-8 text-center space-y-6">
      <div className="flex flex-col items-center gap-4">
        <div className="rounded-full bg-red-50 p-3 dark:bg-red-900/20">
          <AlertCircle className="h-8 w-8 text-red-500" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">Something went wrong</h3>
          <p className="text-sm text-muted-foreground mt-1">{error.message}</p>
        </div>
      </div>
      <Button variant="outline" onClick={resetErrorBoundary} className="gap-2">
        <ArrowUpRight className="h-4 w-4" />
        Try again
      </Button>
    </div>
  )
);
ErrorFallback.displayName = "ErrorFallback";

const LoadingState = memo(() => (
  <div className="p-6 space-y-4">
    <div className="flex items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-primary/50" />
    </div>
    {[...Array(3)].map((_, i) => (
      <div
        key={i}
        className="border rounded-lg p-4 relative overflow-hidden bg-card"
      >
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-full bg-muted/60 animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-48 bg-muted/60 rounded animate-pulse" />
            <div className="h-3 w-32 bg-muted/40 rounded animate-pulse" />
          </div>
          <div className="h-6 w-16 bg-muted/50 rounded-full animate-pulse" />
        </div>
        <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>
    ))}
  </div>
));
LoadingState.displayName = "LoadingState";

const SearchResultsList = memo(
  ({
    results,
    onResultClick,
  }: {
    results: SearchResult[];
    onResultClick: () => void;
  }) => {
    return (
      <ul className="p-2 space-y-3">
        {results.map((item) => (
          <SearchResultItem
            key={item.id}
            result={item}
            onClick={onResultClick}
          />
        ))}
      </ul>
    );
  }
);
SearchResultsList.displayName = "SearchResultsList";

const SearchResultItem = memo(
  ({
    result,
    onClick,
  }: {
    result: SearchResult;
    onClick: () => void;
  }) => {
    const Icon = RESULT_ICONS[result.type];

    return (
      <li>
        <Link
          href={getResultUrl(result)}
          onClick={onClick}
          className={cn(
            "block p-4 border border-zinc-200/80 rounded-lg",
            "hover:bg-accent/30 ",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            "group relative bg-card"
          )}
        >
          <div className="flex items-start gap-5">
            <div className="shrink-0 mt-1">
              <div className="p-2.5 rounded-md bg-primary/5">
                <Icon className="h-5 w-5 text-primary/70" />
              </div>
            </div>
            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-center gap-3">
                <span className="font-medium text-foreground/90 truncate">
                  {result.title.length > 20 ? `${result.title.slice(0, 18)}...` : result.title}
                </span>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              {result.description && (
                <p className="text-sm text-muted-foreground line-clamp-1">
                  {result.description}
                </p>
              )}
            </div>
            <Badge
              variant="secondary"
              className="capitalize shrink-0 gap-1.5 py-1.5 px-3"
            >
              <Icon className="h-3.5 w-3.5 opacity-70" />
              {result.type}
            </Badge>
          </div>
        </Link>
      </li>
    );
  }
);
SearchResultItem.displayName = "SearchResultItem";

const Pagination = memo(
  ({
    page,
    totalPages,
    onPageChange,
  }: {
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  }) => (
    <div className="flex items-center justify-between px-4 py-3 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <TooltipProvider>
        <div className="flex items-center gap-4 justify-between w-full">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(page - 1)}
                disabled={page <= 1}
                className="group"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <div className="flex items-center gap-1.5">
                <KeyboardIcon className="h-3 w-3" />
                <span>Press ←</span>
              </div>
            </TooltipContent>
          </Tooltip>

          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Page</span>
            <span className="font-medium">{page}</span>
            <span className="text-muted-foreground">of</span>
            <span className="font-medium">{totalPages}</span>
          </div>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(page + 1)}
                disabled={page >= totalPages}
                className="group"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <div className="flex items-center gap-1.5">
                <KeyboardIcon className="h-3 w-3" />
                <span>Press →</span>
              </div>
            </TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    </div>
  )
);
Pagination.displayName = "Pagination";

const NoResults = memo(() => (
  <div className="p-12 text-center space-y-6">
    <div className="flex flex-col items-center gap-4">
      <div className="rounded-full bg-muted p-3">
        <Search className="h-8 w-8 text-muted-foreground" />
      </div>
      <div>
        <h3 className="text-lg font-semibold">No results found</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Try adjusting your search or filters to find what you re looking for
        </p>
      </div>
    </div>
  </div>
));
NoResults.displayName = "NoResults";

const ResultsHeader = memo(({ total }: { total: number }) => (
  <div className="sticky top-0 px-6 py-4 text-sm border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Clock className="h-4 w-4 text-primary/70" />
        <span className="text-foreground/80">
          Found <span className="font-medium text-foreground">{total}</span>{" "}
          results
        </span>
      </div>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <KeyboardIcon className="h-3 w-3" />
              <span>Use arrow keys to navigate</span>
            </div>
          </TooltipTrigger>
          <TooltipContent side="left">
            <div className="text-xs">
              Press{" "}
              <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-medium">
                ←
              </kbd>{" "}
              or{" "}
              <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-medium">
                →
              </kbd>{" "}
              to change pages
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  </div>
));
ResultsHeader.displayName = "ResultsHeader";

const SearchResults = memo(
  ({
    isLoading,
    isError,
    results,
    total,
    page,
    onPageChange,
    onResultClick,
  }: SearchResultsProps) => {
    const [isPending, startTransition] = useTransition();
    const prevResultsRef = useRef(results);
    const totalPages = useMemo(
      () => Math.ceil(total / ITEMS_PER_PAGE),
      [total]
    );
    const contentRef = useRef<HTMLDivElement>(null);

    // Keyboard navigation with memoized callbacks
    const handlePrevPage = useCallback(() => {
      if (page > 1) {
        startTransition(() => {
          onPageChange(page - 1);
        });
      }
    }, [page, onPageChange]);

    const handleNextPage = useCallback(() => {
      if (page < totalPages) {
        startTransition(() => {
          onPageChange(page + 1);
        });
      }
    }, [page, totalPages, onPageChange]);

    useKeyboardShortcut("ArrowLeft", handlePrevPage);
    useKeyboardShortcut("ArrowRight", handleNextPage);

    // Use layout effect to prevent flashing and maintain scroll position
    useIsomorphicLayoutEffect(() => {
      if (contentRef.current) {
        const scrollTop = contentRef.current.scrollTop;
        prevResultsRef.current = results;
        contentRef.current.scrollTop = scrollTop;
      }
    }, [results]);

    // Render states
    if (isLoading || isPending) return <LoadingState />;
    if (isError)
      return (
        <ErrorFallback
          error={new Error("Failed to load results")}
          resetErrorBoundary={() => {}}
        />
      );
    if (!results.length) return <NoResults />;

    return (
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <div className="relative flex flex-col h-full">
          <ResultsHeader total={total} />

          <div className="flex-1 px-4 py-3" ref={contentRef}>
            <ScrollArea
              className="h-full custom-scrollbar -mx-4 px-4"
              type="always"
            >
              <SearchResultsList
                results={results}
                onResultClick={onResultClick}
              />
            </ScrollArea>
          </div>

          {totalPages > 1 && (
            <div className="sticky bottom-0 mt-auto">
              <Pagination
                page={page}
                totalPages={totalPages}
                onPageChange={(newPage) => {
                  startTransition(() => {
                    onPageChange(newPage);
                  });
                }}
              />
            </div>
          )}
        </div>
      </ErrorBoundary>
    );
  }
);
SearchResults.displayName = "SearchResults";

export default SearchResults;
