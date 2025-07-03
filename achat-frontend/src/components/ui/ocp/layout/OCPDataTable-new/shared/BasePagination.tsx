import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useCallback } from "react";

interface BasePaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function BasePagination({
  currentPage,
  totalPages,
  onPageChange,
}: BasePaginationProps) {
  const handlePageChange = useCallback(
    (page: number) => {
      if (page >= 1 && page <= totalPages) {
        onPageChange(page);
      }
    },
    [totalPages, onPageChange]
  );

  if (totalPages <= 1) return null;

  return (
    <Pagination className="w-fit mx-0 select-none">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            onClick={() => handlePageChange(currentPage - 1)}
            className={`transition-opacity ${
              currentPage <= 1
                ? "pointer-events-none opacity-50"
                : "cursor-pointer hover:opacity-80"
            }`}
          />
        </PaginationItem>
        <PaginationItem className="flex items-center px-4">
          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
        </PaginationItem>
        <PaginationItem>
          <PaginationNext
            onClick={() => handlePageChange(currentPage + 1)}
            className={`transition-opacity ${
              currentPage >= totalPages
                ? "pointer-events-none opacity-50"
                : "cursor-pointer hover:opacity-80"
            }`}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
