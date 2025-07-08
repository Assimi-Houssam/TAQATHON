import { Loader2 } from "lucide-react";

interface TableLoadingProps {
  columns: number;
  rows?: number;
}

/**
 * TableLoading - Loading state component for data tables
 * Shows unified white and blue loading animation while data is being fetched
 */
export function TableLoading({ columns, rows = 5 }: TableLoadingProps) {
  return (
    <div className="w-full py-8">
      <div className="relative group">
        {/* Outer glow effect */}
        <div className="absolute -inset-1 bg-blue-500/10 rounded-2xl blur-sm opacity-75 group-hover:opacity-100 transition duration-500"></div>
        
        {/* Main card */}
        <div className="relative bg-white/5 backdrop-blur-sm border-2 border-dashed border-blue-300/30 hover:border-blue-400/50 rounded-2xl p-8 transition-all duration-500 hover:shadow-xl hover:shadow-blue-500/5">
          {/* Background pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/5 to-transparent rounded-2xl"></div>
          
          {/* Loading header */}
          <div className="relative flex flex-col items-center justify-center text-center space-y-6 mb-8">
            {/* Icon container */}
            <div className="relative">
              <div className="absolute -inset-2 bg-blue-500/20 rounded-full blur-sm opacity-50"></div>
              <div className="relative bg-white/10 border border-dashed border-blue-300/50 rounded-full p-6 hover:scale-105 transition-transform duration-300">
                <Loader2 className="h-10 w-10 text-blue-400 animate-spin" />
              </div>
            </div>
            
            {/* Text content */}
            <div className="space-y-3">
              <h3 className="text-xl font-semibold text-white">
                Loading data...
              </h3>
              <p className="text-sm text-blue-100/70 max-w-md leading-relaxed">
                Please wait while we fetch your information.
              </p>
            </div>
          </div>
          
          {/* Loading table */}
          <div className="relative space-y-4">
            {/* Header row */}
            <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
              {Array.from({ length: columns }).map((_, index) => (
                <div
                  key={`header-${index}`}
                  className="relative h-8 bg-white/10 rounded-lg border border-dashed border-blue-300/30 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-blue-500/10 animate-pulse"></div>
                  <div 
                    className="absolute inset-0 bg-white/5 animate-pulse"
                    style={{ 
                      animationDelay: `${index * 0.2}s`,
                      animationDuration: '2s'
                    }}
                  ></div>
                </div>
              ))}
            </div>
            
            {/* Data rows */}
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <div 
                key={`row-${rowIndex}`} 
                className="grid gap-4" 
                style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
              >
                {Array.from({ length: columns }).map((_, colIndex) => (
                  <div
                    key={`cell-${rowIndex}-${colIndex}`}
                    className="relative h-6 bg-white/5 rounded-md border border-dashed border-blue-300/20 overflow-hidden"
                  >
                    {/* Shimmer effect */}
                    <div 
                      className="absolute inset-0 bg-blue-500/10 animate-pulse"
                      style={{ 
                        animationDelay: `${(rowIndex * columns + colIndex) * 0.1}s`,
                        animationDuration: '1.5s'
                      }}
                    ></div>
                    
                    {/* Moving light effect */}
                    <div 
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-400/20 to-transparent translate-x-[-100%] animate-[shimmer_2s_infinite]"
                      style={{ 
                        animationDelay: `${(rowIndex * columns + colIndex) * 0.15}s`
                      }}
                    ></div>
                  </div>
                ))}
              </div>
            ))}
          </div>
          
          {/* Decorative elements */}
          <div className="flex justify-center space-x-2 mt-8">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-blue-300 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
            <div className="w-2 h-2 bg-blue-200 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
          </div>
        </div>
      </div>
      
      {/* Custom shimmer animation */}
      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
} 