interface TableLoadingProps {
  columns: number;
  rows?: number;
}

/**
 * TableLoading - Loading state component for data tables
 * Shows skeleton loaders while data is being fetched
 */
export function TableLoading({ columns, rows = 8 }: TableLoadingProps) {
  return (
    <div className="w-full space-y-6">
      {/* Filter Row Skeleton */}
      <div className="flex items-center gap-4 mb-6">
        <div className="h-9 w-64 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-9 w-32 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-9 w-28 bg-gray-200 rounded animate-pulse"></div>
        <div className="ml-auto h-9 w-36 bg-gray-200 rounded animate-pulse"></div>
      </div>

      {/* Table Container */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        {/* Table Header Skeleton */}
        <div className="bg-gray-50 border-b border-gray-200 p-4">
          <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
            {Array.from({ length: columns }).map((_, index) => (
              <div key={`header-${index}`} className="h-5 bg-gray-300 rounded animate-pulse"></div>
            ))}
          </div>
        </div>
        
        {/* Table Rows Skeleton */}
        <div className="divide-y divide-gray-100">
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <div 
              key={`row-${rowIndex}`} 
              className="p-4 hover:bg-gray-50"
            >
              <div 
                className="grid gap-4" 
                style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
              >
                {Array.from({ length: columns }).map((_, colIndex) => {
                  // Vary the width of skeleton elements for more realistic look
                  const widths = ['w-full', 'w-3/4', 'w-2/3', 'w-1/2', 'w-1/3'];
                  const randomWidth = widths[Math.floor((rowIndex + colIndex) % widths.length)];
                  
                  return (
                    <div key={`cell-${rowIndex}-${colIndex}`} className={`h-4 ${randomWidth}`}>
                      <div 
                        className="h-full bg-gray-200 rounded animate-pulse"
                        style={{ 
                          animationDelay: `${(rowIndex * columns + colIndex) * 0.05}s` 
                        }}
                      ></div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 