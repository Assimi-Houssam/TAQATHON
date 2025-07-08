import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TableErrorProps {
  message: string;
  onRetry?: () => void;
}

/**
 * TableError - Error state component for data tables
 * Shows error message with optional retry functionality in unified white and blue design
 */
export function TableError({ message, onRetry }: TableErrorProps) {
  return (
    <div className="w-full py-8">
      <div className="relative group">
        {/* Outer glow effect */}
        <div className="absolute -inset-1 bg-blue-500/10 rounded-2xl blur-sm opacity-75 group-hover:opacity-100 transition duration-500"></div>
        
        {/* Main card */}
        <div className="relative bg-white/5 backdrop-blur-sm border-2 border-dashed border-blue-300/30 hover:border-blue-400/50 rounded-2xl p-8 transition-all duration-500 hover:shadow-xl hover:shadow-blue-500/5">
          {/* Background pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/5 to-transparent rounded-2xl"></div>
          
          <div className="relative flex flex-col items-center justify-center text-center space-y-6">
            {/* Icon container */}
            <div className="relative">
              <div className="absolute -inset-2 bg-blue-500/20 rounded-full blur-sm opacity-50"></div>
              <div className="relative bg-white/10 border border-dashed border-blue-300/50 rounded-full p-6 hover:scale-105 transition-transform duration-300">
                <AlertTriangle className="h-10 w-10 text-blue-400" />
              </div>
            </div>
            
            {/* Error message */}
            <div className="space-y-3">
              <h3 className="text-xl font-semibold text-white">
                Something went wrong
              </h3>
              <p className="text-sm text-blue-100/70 max-w-md leading-relaxed">
                {message}
              </p>
            </div>
            
            {/* Retry button if available */}
            {onRetry && (
              <div className="relative">
                <div className="absolute -inset-1 bg-blue-500/20 rounded-lg blur opacity-50 group-hover:opacity-75 transition duration-300"></div>
                <Button
                  variant="outline"
                  onClick={onRetry}
                  className="relative bg-white/10 border border-dashed border-blue-300/50 hover:border-blue-400/50 text-blue-100 hover:text-white hover:scale-105 transition-all duration-300 px-6 py-2 rounded-lg backdrop-blur-sm"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry
                </Button>
              </div>
            )}
            
            {/* Decorative elements */}
            <div className="flex space-x-2 mt-4">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-blue-300 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
              <div className="w-2 h-2 bg-blue-200 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 