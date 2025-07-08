import { Database } from "lucide-react";

interface TableEmptyProps {
  message?: string;
  description?: string;
}

/**
 * TableEmpty - Empty state component for data tables
 * Shows a message when no data is available with clean, professional design
 */
export function TableEmpty({
  message = "No data available",
  description = "There are no items to display at the moment."
}: TableEmptyProps) {
  return (
    <div className="w-full py-12 relative">
      <div className="relative">
        <div className="border-2 border-dashed border-gray-300 rounded-lg bg-white p-8 py-16 text-center transition-colors hover:border-gray-400/70 relative">
          {/* Icon */}
          <div className="mx-auto mb-4 w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
            <Database className="h-6 w-6 text-gray-500" />
          </div>

          {/* Content */}
          <div className="space-y-2">
            <h3 className="text-lg font-medium text-gray-900">
              {message}
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              {description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 