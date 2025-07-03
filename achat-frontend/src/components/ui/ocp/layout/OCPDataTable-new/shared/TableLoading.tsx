import { Loader2 } from "lucide-react";

interface TableLoadingProps {
  columns: number;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function TableLoading({ columns }: TableLoadingProps) {
  return (
    <div className="w-full bg-card rounded-lg border shadow-sm">
      <div className="flex h-[400px] w-full items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading data...</p>
        </div>
      </div>
    </div>
  );
} 