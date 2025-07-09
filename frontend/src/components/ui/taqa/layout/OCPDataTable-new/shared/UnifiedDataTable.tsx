import { useState, useEffect, useCallback } from "react";
import { BaseDataTable } from "./BaseDataTable";
import { BaseSearchBar } from "./BaseSearchBar";
import { BasePagination } from "./BasePagination";
import { Column } from "./BaseDataTable";
import { FilterGroup } from "./BaseSearchBar";
import { motion, AnimatePresence } from "framer-motion";

interface UnifiedDataTableProps<T> {
  columns: Column<T>[];
  queryResult: {
    data?: { users?: T[]; companies?: T[]; total?: number };
    isLoading: boolean;
    error: Error | null;
  };
  searchableFields: (keyof T)[];
  filters?: FilterGroup[];
  className?: string;
  onSearch?: (term: string) => void;
  page: number;
  onPageChange: (page: number) => void;
  limit: number;
}

const LoadingOverlay = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="absolute inset-0 bg-gradient-to-br from-background/100 to-background/95 backdrop-blur-sm flex items-center justify-center z-50"
  >
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="flex flex-col items-center gap-6"
    >
      <div className="relative">
        <div className="absolute inset-0 animate-ping rounded-full bg-primary/20 size-16" />
        <div className="absolute inset-0 animate-pulse rounded-full bg-primary/30 size-16" />
        <div className="relative size-16 rounded-full border-t-2 border-r-2 border-primary animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="size-2 rounded-full bg-primary" />
        </div>
      </div>

      <motion.div
        initial={{ width: 0 }}
        animate={{ width: "auto" }}
        className="overflow-hidden"
      >
        <motion.span
          className="text-sm font-medium text-primary block whitespace-nowrap"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Loading Data...
        </motion.span>
      </motion.div>
    </motion.div>
  </motion.div>
);

const EmptyState = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-col items-center justify-center py-16 text-center"
  >
    <motion.div
      className="relative size-20 mb-6"
      animate={{
        rotate: 360,
        scale: [1, 1.1, 1],
      }}
      transition={{
        rotate: { duration: 20, repeat: Infinity, ease: "linear" },
        scale: { duration: 2, repeat: Infinity },
      }}
    >
      <div className="absolute inset-0 border border-muted-foreground/20 rounded-full" />
      <div className="absolute inset-2 border border-muted-foreground/30 rounded-full" />
      <div className="absolute inset-4 border border-muted-foreground/40 rounded-full" />
      <div className="absolute inset-6 border border-muted-foreground/50 rounded-full" />
      <div className="absolute inset-8 border border-primary rounded-full" />
    </motion.div>
    <h3 className="text-lg font-medium bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/50">
      No Data Found
    </h3>
    <p className="text-sm text-muted-foreground mt-2 max-w-[250px]">
      Try adjusting your search parameters or filters
    </p>
  </motion.div>
);

const ErrorState = ({ error }: { error: Error }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-col items-center justify-center py-16 text-center"
  >
    <motion.div
      className="relative size-20 mb-6"
      animate={{
        rotate: [0, 5, -5, 0],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      <div className="absolute inset-0 border-2 border-red-500/50 rounded-lg rotate-45" />
      <div className="absolute inset-0 border-2 border-red-500/30 rounded-lg -rotate-45" />
      <div className="absolute inset-4 flex items-center justify-center">
        <span className="text-2xl text-red-500">!</span>
      </div>
    </motion.div>
    <h3 className="text-lg font-medium text-red-500">Error Loading Data</h3>
    <p className="text-sm text-muted-foreground mt-2 max-w-[300px]">
      {error.message}
    </p>
  </motion.div>
);

export function UnifiedDataTable<T>({
  columns,
  queryResult,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  searchableFields,
  filters = [],
  className,
  onSearch,
  page,
  onPageChange,
  limit,
}: UnifiedDataTableProps<T>) {
  const [sortField, setSortField] = useState<keyof T | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [isLoadingWithDelay, setIsLoadingWithDelay] = useState(false);

  const { data: responseData, isLoading, error } = queryResult;
  const data = responseData?.users || responseData?.companies || [];
  const total = responseData?.total || 0;

  const totalPages = Math.max(1, Math.ceil(total / limit));

  const handleSearch = useCallback(
    (term: string) => {
      if (onSearch) {
        onSearch(term);
      }
    },
    [onSearch]
  );

  const handlePageChange = useCallback(
    (newPage: number) => {
      if (newPage >= 1 && newPage <= totalPages && onPageChange) {
        onPageChange(newPage);
      }
    },
    [totalPages, onPageChange]
  );

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (isLoading) {
      setIsLoadingWithDelay(true);
    } else {
      timeout = setTimeout(() => {
        setIsLoadingWithDelay(false);
      }, 2500);
    }
    return () => clearTimeout(timeout);
  }, [isLoading]);

  const handleSort = (field: keyof T) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 relative"
    >
      <motion.div
        className="flex flex-col md:flex-row gap-4 md:items-center justify-between"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <BaseSearchBar
          onSearch={handleSearch}
          placeholder="Search..."
          filters={filters}
          className="md:w-1/2 w-full"
        />
      </motion.div>

      <motion.div
        className="bg-card rounded-lg border shadow-sm relative overflow-hidden"
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
      >
        <AnimatePresence>
          {isLoadingWithDelay && <LoadingOverlay />}
        </AnimatePresence>

        {error ? (
          <ErrorState error={error} />
        ) : data && data.length === 0 ? (
          <EmptyState />
        ) : (
          <BaseDataTable<T>
            data={data}
            columns={columns}
            onSort={handleSort}
            sortField={sortField || undefined}
            sortDirection={sortDirection}
            loading={isLoading}
            error={error}
            className={className}
          />
        )}

        {data && data.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="border-t p-4 flex items-center justify-end"
          >
            <BasePagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}
