import { Database } from "lucide-react";

interface TableEmptyProps {
  message?: string;
  description?: string;
}

/**
 * TableEmpty - Empty state component for data tables
 * Shows a message when no data is available
 */
export function TableEmpty({ 
  message = "No data available", 
  description = "There are no items to display at the moment." 
}: TableEmptyProps) {
  return (
    <div className="w-full p-12">
      <div className="flex flex-col items-center justify-center text-center space-y-4">
        <div className="rounded-full bg-muted p-4">
          <Database className="h-8 w-8 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-medium text-foreground">{message}</h3>
          <p className="text-sm text-muted-foreground max-w-md">{description}</p>
        </div>
      </div>
    </div>
  );
} 