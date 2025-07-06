import React from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PaginationProps } from "../types";

/**
 * Pagination - Navigation component for data tables
 * 
 * Features:
 * - First/last page navigation
 * - Previous/next page navigation
 * - Page number display
 * - Responsive design
 */
export function Pagination({ 
  currentPage, 
  totalPages, 
  onPageChange 
}: PaginationProps) {
  const canGoPrevious = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  const handlePageChange = (page: number, event?: React.MouseEvent) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  // Don't render pagination if there's only one page or no pages
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex items-center justify-between px-2">
      <div className="flex items-center space-x-2">
        <p className="text-sm text-muted-foreground">
          Page {currentPage} of {totalPages}
        </p>
      </div>
      
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => handlePageChange(1, e)}
          disabled={!canGoPrevious}
          className="hidden sm:flex"
        >
          <ChevronsLeft className="h-4 w-4" />
          <span className="sr-only">Go to first page</span>
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => handlePageChange(currentPage - 1, e)}
          disabled={!canGoPrevious}
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">Go to previous page</span>
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => handlePageChange(currentPage + 1, e)}
          disabled={!canGoNext}
        >
          <ChevronRight className="h-4 w-4" />
          <span className="sr-only">Go to next page</span>
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => handlePageChange(totalPages, e)}
          disabled={!canGoNext}
          className="hidden sm:flex"
        >
          <ChevronsRight className="h-4 w-4" />
          <span className="sr-only">Go to last page</span>
        </Button>
      </div>
    </div>
  );
} 