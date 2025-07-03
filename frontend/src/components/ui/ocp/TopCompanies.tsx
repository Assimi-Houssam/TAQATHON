import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  Building2,
  TrendingUp,
  Award,
  BarChart3,
  Building,
  AlertCircle,
  ChevronUp,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useCallback, useState, useEffect, useRef } from "react";

interface Company {
  name: string;
  bids: number;
  won: number;
  category: string;
  categories: string[];
}

const CompanyItem = ({ company }: { company: Company }) => {
  const successRate = ((company.won / company.bids) * 100).toFixed(1);
  const isHighPerformer = Number(successRate) > 60;

  return (
    <div
      className={cn(
        "group relative bg-white/50 rounded-lg border border-gray-100 transition-all duration-200",
        "hover:border-gray-200 hover:shadow-sm p-4"
      )}
    >
      <div className="flex items-center gap-4">
        <div
          className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
            "bg-gradient-to-br from-custom-green-50 to-custom-green-100",
            "text-custom-green-600"
          )}
        >
          <Building2 className="h-5 w-5" />
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
                  {company.bids} bids
                </span>
                <span className="text-sm text-custom-green-600 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  {company.won} won
                </span>
              </div>
            </div>

            <div className="shrink-0">
              <div
                className={cn(
                  "text-sm font-medium rounded-full px-2.5 py-1",
                  Number(successRate) >= 50
                    ? "bg-custom-green-50 text-custom-green-700"
                    : Number(successRate) >= 30
                    ? "bg-amber-50 text-amber-700"
                    : "bg-gray-50 text-gray-700"
                )}
              >
                {successRate}%
              </div>
            </div>
          </div>

          <div className="mt-2 w-full bg-gray-100 rounded-full h-1.5">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                Number(successRate) >= 50
                  ? "bg-custom-green-500"
                  : Number(successRate) >= 30
                  ? "bg-amber-500"
                  : "bg-gray-400"
              )}
              style={{ width: `${successRate}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

interface TopCompaniesProps {
  companies: Company[];
  className?: string;
  selectedCategory?: string;
  hasMore?: boolean;
  isLoading?: boolean;
  observerRef?: (node?: Element | null) => void;
  error?: string | null;
  onRetry?: () => void;
}

const LoadingState = () => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-col items-center justify-center py-8"
  >
    <p className="text-sm text-gray-500">No companies</p>
  </motion.div>
);

const EmptyState = ({ selectedCategory }: { selectedCategory: string }) => (
  <div className="flex flex-col items-center justify-center py-12 px-4 space-y-4">
    <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center">
      <Building className="w-8 h-8 text-gray-400" />
    </div>
    <div className="text-center space-y-2">
      <h3 className="text-sm font-medium text-gray-900">No companies found</h3>
      <p className="text-sm text-gray-500">
        {selectedCategory === "all"
          ? "No companies have been registered yet."
          : `No companies found in the "${selectedCategory}" category.`}
      </p>
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
        Failed to load companies
      </h3>
      <p className="text-sm text-gray-500">
        There was an error loading the companies. Please try again.
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
  companiesCount,
}: {
  isLoading: boolean;
  hasMore: boolean;
  companiesCount: number;
}) => {
  if (isLoading) {
    return <LoadingState />;
  }

  if (!hasMore && companiesCount > 0) {
    return (
      <div className="flex items-center justify-center py-6">
        <div className="px-4 py-2 bg-gray-50 rounded-full">
          <p className="text-sm text-gray-500">No more companies to load</p>
        </div>
      </div>
    );
  }

  return null;
};

const AnimatedCompanyItem = motion(CompanyItem);

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

  return (
    <AnimatePresence>
      {showScroll && (
        <motion.button
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          onClick={scrollTop}
          className="fixed bottom-4 right-4 bg-custom-green-600 text-white rounded-full p-2 shadow-lg hover:bg-custom-green-700 transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <ChevronUp className="w-5 h-5" />
        </motion.button>
      )}
    </AnimatePresence>
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
  const filteredCompanies = companies.filter(
    (company) =>
      selectedCategory === "all" ||
      company.categories.some(
        (category) => category.toLowerCase() === selectedCategory.toLowerCase()
      )
  );

  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const renderContent = () => {
    if (error) {
      return <ErrorState onRetry={onRetry} />;
    }

    if (filteredCompanies.length === 0 && !isLoading) {
      return <EmptyState selectedCategory={selectedCategory} />;
    }

    return (
      <div className="space-y-3">
        {filteredCompanies.map((company, index) => (
          <AnimatedCompanyItem
            key={company.name + index}
            company={company}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.3,
              delay: (index % 10) * 0.05,
            }}
          />
        ))}
        <LoadMoreIndicator
          isLoading={isLoading}
          hasMore={hasMore}
          companiesCount={filteredCompanies.length}
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
            <AnimatePresence mode="popLayout">
              {renderContent()}
            </AnimatePresence>
          </div>
        </ScrollArea>
        <ScrollToTop
          scrollAreaRef={scrollAreaRef as React.RefObject<HTMLDivElement>}
        />
      </CardContent>
    </Card>
  );
};
