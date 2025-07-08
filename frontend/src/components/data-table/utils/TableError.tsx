import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TableErrorProps {
  message: string;
  onRetry?: () => void;
}

/**
 * TableError - Error state component for data tables
 * Shows error message with optional retry functionality in clean design
 */
export function TableError({ message, onRetry }: TableErrorProps) {
  return (
    <div className="w-full py-12 relative">
      <div className="relative">
        <div className="border-2 border-dashed border-gray-300 rounded-lg bg-white p-8 py-16 text-center transition-colors hover:border-gray-400/70 relative">
          {/* Icon */}
          <div className="mx-auto mb-4 w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
            <AlertTriangle className="h-6 w-6 text-gray-500" />
          </div>

          {/* Content */}
          <div className="space-y-2 mb-6">
            <h3 className="text-lg font-medium text-gray-900">
              Something went wrong
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              {message}
            </p>
          </div>

          {/* Retry button if available */}
          {onRetry && (
            <Button
              variant="outline"
              onClick={onRetry}
              className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          )}
        </div>
      </div>
    </div>
  );
} 