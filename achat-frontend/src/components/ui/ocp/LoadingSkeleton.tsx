export const LoadingSkeleton = () => {
  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="p-8 space-y-8 max-w-[2000px] mx-auto">
        <div className="flex items-center justify-between">
          <div className="space-y-4">
            <div className="h-8 w-64 bg-gray-200 rounded-md animate-pulse" />
            <div className="h-4 w-96 bg-gray-100 rounded-md animate-pulse" />
          </div>
          <div className="flex gap-4">
            <div className="h-10 w-48 bg-gray-200 rounded-md animate-pulse" />
            <div className="h-10 w-48 bg-gray-200 rounded-md animate-pulse" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-5 gap-4 mt-8">
          {Array(5).fill(0).map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse" />
                <div className="h-4 w-24 bg-gray-200 rounded-md animate-pulse" />
              </div>
              <div className="space-y-2">
                <div className="h-8 w-20 bg-gray-100 rounded-md animate-pulse" />
                <div className="h-4 w-32 bg-gray-100 rounded-md animate-pulse" />
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 2xl:grid-cols-2 gap-4 2xl:gap-8">
          {Array(2).fill(0).map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-6 shadow-sm h-[400px]">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse" />
                  <div className="h-4 w-48 bg-gray-200 rounded-md animate-pulse" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 h-[calc(100%-3rem)]">
                {Array(6).fill(0).map((_, j) => (
                  <div key={j} className="h-full bg-gray-100 rounded-lg animate-pulse" 
                       style={{ animationDelay: `${j * 0.1}s` }} />
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 2xl:gap-8">
          {Array(2).fill(0).map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-6 shadow-sm h-[500px]">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse" />
                  <div className="h-4 w-48 bg-gray-200 rounded-md animate-pulse" />
                </div>
                {i === 0 && (
                  <div className="h-10 w-48 bg-gray-200 rounded-md animate-pulse" />
                )}
              </div>
              <div className="space-y-4">
                {Array(6).fill(0).map((_, j) => (
                  <div key={j} className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-gray-100 animate-pulse" 
                         style={{ animationDelay: `${j * 0.1}s` }} />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-3/4 bg-gray-100 rounded-md animate-pulse" 
                           style={{ animationDelay: `${j * 0.1}s` }} />
                      <div className="h-3 w-1/2 bg-gray-100 rounded-md animate-pulse" 
                           style={{ animationDelay: `${j * 0.1}s` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}; 