import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChevronUp, ChevronDown, CircleX } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { BaseDataTableProps } from "../types";
import { TableError } from "../utils/TableError";
import { TableLoading } from "../utils/TableLoading";
import { TableEmpty } from "../utils/TableEmpty";

/**
 * BaseDataTable - Core table component with sorting, responsive design, and custom rendering
 * 
 * Features:
 * - Generic TypeScript support for any data type
 * - Sortable columns with visual indicators
 * - Responsive design with hidden columns on mobile
 * - Custom cell rendering
 * - Loading, error, and empty states
 * - Internationalization support
 * 
 * @template T - The data type for table rows
 */
export function BaseDataTable<T>({
  data,
  columns,
  sortField,
  sortDirection,
  onSort,
  loading = false,
  error = null,
  className,
}: BaseDataTableProps<T>) {
  const t = useTranslations("dataTable");

  // Handle loading state
  if (loading) {
    return <TableLoading columns={columns.length} />;
  }

  // Handle error state
  if (error) {
    return <TableError message={error.message} />;
  }

  // Handle empty state
  if (!data.length) {
    return <TableEmpty />;
  }

  return (
    <div className="w-full overflow-auto">
      <table className={cn("w-full caption-bottom text-sm", className)}>
        <TableHeader>
          <TableRow className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
            {columns.map((column, index) => (
              <TableHead
                key={String(column.accessor)}
                className={cn(
                  "px-4 text-left align-middle font-medium text-muted-foreground",
                  column.hidden && "hidden xl:table-cell",
                  column.clickable &&
                    onSort &&
                    "select-none hover:bg-muted/50 cursor-pointer",
                  !column.clickable && "cursor-default",
                  "transition-colors",
                  index === columns.length - 1 && "text-right"
                )}
                style={{
                  width: column.width,
                  maxWidth: column.width || "200px",
                }}
                onClick={() => {
                  if (column.clickable && onSort) {
                    onSort(column.accessor);
                  }
                }}
              >
                <div
                  className={cn(
                    "flex items-center gap-2",
                    index === columns.length - 1
                      ? "justify-end"
                      : "justify-between"
                  )}
                >
                  <span className="truncate">{column.header}</span>
                  {column.clickable && sortField === column.accessor && (
                    <span className="flex-shrink-0">
                      {sortDirection === "asc" ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </span>
                  )}
                  {column.clickable && sortField !== column.accessor && (
                    <span className="flex-shrink-0 opacity-0 group-hover:opacity-50 transition-opacity">
                      <ChevronUp className="h-4 w-4" />
                    </span>
                  )}
                </div>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="h-[400px] text-center"
              >
                <div className="flex flex-col items-center justify-center gap-3">
                  <div className="rounded-full bg-muted p-3">
                    <CircleX className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground">{t("noResults")}</p>
                  <p className="text-sm text-muted-foreground">
                    {t("tryAdjustingSearchOrFilters")}
                  </p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            <>
              {data.map((item, index) => (
                <TableRow
                  key={index}
                  className={cn(
                    "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
                    index === data.length - 1 && "border-0"
                  )}
                >
                  {columns.map((column, colIndex) => (
                    <TableCell
                      key={String(column.accessor)}
                      className={cn(
                        "p-2 align-middle [&:has([role=checkbox])]:pr-0",
                        column.hidden && "hidden xl:table-cell",
                        colIndex === columns.length - 1 && "text-right"
                      )}
                      style={{
                        width: column.width,
                        maxWidth: column.width || "200px",
                      }}
                    >
                      {column.render
                        ? column.render(item[column.accessor], item)
                        : String(item[column.accessor])}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
              {/* Fill remaining space if less than 10 rows */}
              {data.length < 10 && (
                <TableRow className="hover:bg-transparent">
                  <TableCell
                    colSpan={columns.length}
                    className="h-[calc(53px*{10-data.length})] border-b-0"
                  />
                </TableRow>
              )}
            </>
          )}
        </TableBody>
      </table>
    </div>
  );
} 