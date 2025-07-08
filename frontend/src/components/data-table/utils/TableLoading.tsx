import { Loader2 } from "lucide-react";

interface TableLoadingProps {
  columns: number;
  rows?: number;
}

/**
 * TableLoading - Loading state component for data tables
 * Shows clean loading animation while data is being fetched
 */
export function TableLoading({ columns, rows = 5 }: TableLoadingProps) {
  return (
    <div className="w-full py-12 relative">
      <div className="relative">
        <div className="border-2 border-dashed border-gray-300 rounded-lg bg-white p-8 py-16 text-center transition-colors hover:border-gray-400/70 relative">
          {/* Icon */}
          <div className="mx-auto mb-4 w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
            <Loader2 className="h-6 w-6 text-gray-500 animate-spin" />
          </div>

          {/* Content */}
          <div className="space-y-2 mb-8">
            <h3 className="text-lg font-medium text-gray-900">
              Loading data...
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Please wait while we fetch your information.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 