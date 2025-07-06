import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  TrendingUp,
  Award,
  BarChart3,
  Building,
  AlertCircle,
  ChevronUp,
  Monitor,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { useCallback, useState, useEffect, useRef } from "react";

interface IndustrialSystem {
  name: string;
  bids: number;
  won: number;
  category: string;
  categories: string[];
}

const SystemItem = ({ company }: { company: IndustrialSystem }) => {
  const efficiency = ((company.won / company.bids) * 100).toFixed(1);
  const isHighPerformer = Number(efficiency) > 95;

  return (
    <div
      className={cn(
        "group relative bg-white/50 rounded-lg border border-gray-100 p-4"
      )}
    >
      <div className="flex items-center gap-4">
        <div
          className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
            "bg-gradient-to-br from-blue-50 to-blue-100",
            "text-blue-600"
          )}
        >
          <Monitor className="h-5 w-5" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-medium text-gray-900 truncate max-w-[200px] flex items-center gap-2">
                {company.name}
                {isHighPerformer && (
                  <Award className="h-4 w-4 text-amber-500" />
                )}
              </h3>
              <div className="flex items-center gap-4 mt-1">
                <span className="text-sm text-gray-500 flex items-center gap-1">
                  <BarChart3 className="h-3 w-3" />
                  {company.bids} sensors
                </span>
                <span className="text-sm text-blue-600 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  {company.won} operational
                </span>
              </div>
            </div>

            <div className="shrink-0">
              <div
                className={cn(
                  "text-sm font-medium rounded-full px-2.5 py-1",
                  Number(efficiency) >= 95
                    ? "bg-green-50 text-green-700"
                    : Number(efficiency) >= 90
                    ? "bg-blue-50 text-blue-700"
                    : Number(efficiency) >= 85
                    ? "bg-amber-50 text-amber-700"
                    : "bg-red-50 text-red-700"
                )}
              >
                {efficiency}%
              </div>
            </div>
          </div>

          <div className="mt-2 w-full bg-gray-100 rounded-full h-1.5">
            <div
              className={cn(
                "h-full rounded-full",
                Number(efficiency) >= 95
                  ? "bg-green-500"
                  : Number(efficiency) >= 90
                  ? "bg-blue-500"
                  : Number(efficiency) >= 85
                  ? "bg-amber-500"
                  : "bg-red-500"
              )}
              style={{ width: `${efficiency}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

interface TopCompaniesProps {
  companies: IndustrialSystem[];
  className?: string;
  selectedCategory?: string;
  hasMore?: boolean;
  isLoading?: boolean;
  observerRef?: (node?: Element | null) => void;
  error?: string | null;
  onRetry?: () => void;
}

const LoadingState = () => (
  <div className="flex flex-col items-center justify-center py-8">
    <p className="text-sm text-gray-500">Loading systems...</p>
  </div>
);

const EmptyState = ({ selectedCategory }: { selectedCategory: string }) => (
  <div className="flex flex-col items-center justify-center py-12 px-4 space-y-4 h-full">
    <div className="flex justify-center mb-4">
      <div className="p-3 bg-blue-50 rounded-lg">
        <Building className="w-12 h-12 text-blue-600" />
      </div>
    </div>

    <div className="text-center space-y-2">
      <h3 className="text-lg font-semibold text-gray-900">
        No industrial systems found
      </h3>
      <p className="text-sm text-gray-500 max-w-sm mx-auto">
        {selectedCategory === "all"
          ? "Connect your industrial systems to start monitoring performance metrics and efficiency scores."
          : `No systems found in the "${selectedCategory}" category. Try selecting a different category or connect more systems.`}
      </p>
    </div>

    <div className="mt-6 flex items-center gap-2 text-xs text-blue-600">
      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
      <span>Ready to connect systems</span>
    </div>
  </div>
);

const ErrorState = ({ onRetry }: { onRetry?: () => void }) => (
  <div className="flex flex-col items-center justify-center py-12 px-4 space-y-4">
    <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
      <AlertCircle className="w-8 h-8 text-red-400" />
    </div>
    <div className="text-center space-y-2">
      <h3 className="text-sm font-medium text-gray-900">
        Failed to load systems
      </h3>
      <p className="text-sm text-gray-500">
        There was an error loading the system performance data. Please try again.
      </p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} className="mt-2">
          Try Again
        </Button>
      )}
    </div>
  </div>
);

const LoadMoreIndicator = ({
  isLoading,
  hasMore,
  systemsCount,
}: {
  isLoading: boolean;
  hasMore: boolean;
  systemsCount: number;
}) => {
  if (isLoading) {
    return <LoadingState />;
  }

  if (!hasMore && systemsCount > 0) {
    return (
      <div className="flex items-center justify-center py-6">
        <div className="px-4 py-2 bg-gray-50 rounded-full">
          <p className="text-sm text-gray-500">No more systems to load</p>
        </div>
      </div>
    );
  }

  return null;
};

const ScrollToTop = ({
  scrollAreaRef,
}: {
  scrollAreaRef: React.RefObject<HTMLDivElement>;
}) => {
  const [showScroll, setShowScroll] = useState(false);

  const checkScrollTop = useCallback((e: Event) => {
    const target = e.target as HTMLDivElement;
    if (!target) return;

    const scrollTop = target.scrollTop;
    if (scrollTop > 400) {
      setShowScroll(true);
    } else {
      setShowScroll(false);
    }
  }, []);

  useEffect(() => {
    const scrollArea = scrollAreaRef.current;
    if (scrollArea) {
      scrollArea.addEventListener("scroll", checkScrollTop);
      return () => scrollArea.removeEventListener("scroll", checkScrollTop);
    }
  }, [scrollAreaRef, checkScrollTop]);

  const scrollTop = () => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  if (!showScroll) return null;

  return (
    <button
      onClick={scrollTop}
      className="fixed bottom-4 right-4 bg-blue-600 text-white rounded-full p-2 shadow-lg hover:bg-blue-700"
    >
      <ChevronUp className="w-5 h-5" />
    </button>
  );
};

export const TopCompanies = ({
  companies,
  className,
  selectedCategory = "all",
  hasMore = false,
  isLoading = false,
  observerRef,
  error = null,
  onRetry,
}: TopCompaniesProps) => {
  const filteredSystems = companies.filter(
    (system) =>
      selectedCategory === "all" ||
      system.categories.some(
        (category) => category.toLowerCase() === selectedCategory.toLowerCase()
      )
  );

  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const renderContent = () => {
    if (error) {
      return <ErrorState onRetry={onRetry} />;
    }

    if (filteredSystems.length === 0 && !isLoading) {
      return <EmptyState selectedCategory={selectedCategory} />;
    }

    return (
      <div className="space-y-3">
        {filteredSystems.map((system, index) => (
          <SystemItem
            key={system.name + index}
            company={system}
          />
        ))}
        <LoadMoreIndicator
          isLoading={isLoading}
          hasMore={hasMore}
          systemsCount={filteredSystems.length}
        />
        <div ref={observerRef} className="h-px w-full" />
      </div>
    );
  };

  return (
    <Card
      className={cn(
        "bg-white/90 backdrop-blur-xl flex flex-col h-full",
        className
      )}
    >
      <CardContent className="flex flex-col h-full p-0 pt-6">
        <ScrollArea
          className="flex-1 -mx-6"
          ref={scrollAreaRef as React.RefObject<HTMLDivElement>}
        >
          <div className="px-6">
            {renderContent()}
          </div>
        </ScrollArea>
        <ScrollToTop
          scrollAreaRef={scrollAreaRef as React.RefObject<HTMLDivElement>}
        />
      </CardContent>
    </Card>
  );
};
