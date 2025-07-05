import { Skeleton } from "@/components/ui/skeleton";
import { TableCell, TableRow } from "@/components/ui/table";

interface TableLoadingProps {
  columns: number;
  rows?: number;
}

/**
 * TableLoading - Loading state component for data tables
 * Shows skeleton rows while data is being fetched
 */
export function TableLoading({ columns, rows = 5 }: TableLoadingProps) {
  return (
    <div className="w-full">
      <div className="overflow-hidden rounded-md border">
        <table className="w-full">
          <thead>
            <TableRow>
              {Array.from({ length: columns }).map((_, index) => (
                <TableCell key={index} className="p-4">
                  <Skeleton className="h-4 w-full" />
                </TableCell>
              ))}
            </TableRow>
          </thead>
          <tbody>
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <TableRow key={rowIndex}>
                {Array.from({ length: columns }).map((_, colIndex) => (
                  <TableCell key={colIndex} className="p-4">
                    <Skeleton className="h-4 w-full" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 