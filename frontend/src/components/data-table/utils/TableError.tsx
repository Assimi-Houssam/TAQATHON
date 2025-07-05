import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface TableErrorProps {
  message: string;
  onRetry?: () => void;
}

/**
 * TableError - Error state component for data tables
 * Shows error message with optional retry functionality
 */
export function TableError({ message, onRetry }: TableErrorProps) {
  return (
    <div className="w-full p-8">
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>{message}</span>
          {onRetry && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              className="ml-4 h-8"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          )}
        </AlertDescription>
      </Alert>
    </div>
  );
} 