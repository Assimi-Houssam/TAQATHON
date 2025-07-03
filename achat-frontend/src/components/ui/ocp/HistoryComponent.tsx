"use client";

import { Bid, BidData } from "@/components/ui/ocp/bid";
import { User, Company } from "@/types/entities/index";
import { Feedback, FeedbackData } from "@/components/ui/ocp/feedback";
import { PurchaseRequestsTable } from "@/components/ui/ocp/purchaseRequestsTable";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { Log, LogsType } from "@/types/entities/index";
import { ActionBadgeIcon } from "@/components/ui/ocp/ActionBadge";
import { useTranslations } from "next-intl";
import CollapWrapper from "@/components/ui/ocp/CollapWrapper";
import { useGetLogs } from "@/endpoints/logs/get-all-logs";
import { useMe } from "@/endpoints/auth/useMe";
import React, { Suspense } from "react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

function SectionTitle({ title }: { title: string }) {
  return (
    <h1 className="text-lg 2xl:text-2xl font-semibold mb-2 2xl:mb-4">
      {title}
    </h1>
  );
}

function BidsComponent() {
  const bidsHistory: BidData[] = [];
  if (bidsHistory.length === 0) {
    return <div className="text-zinc-500">No bids available</div>;
  }
  return (
    <div className="flex flex-col w-full gap-4 max-w-xl">
      {bidsHistory.map((bid) => (
        <Bid key={bid.id} bid={bid} />
      ))}
    </div>
  );
}

function FeedbackComponent() {
  const feedbacks: FeedbackData[] = [];
  const [visibleFeedbacks, setVisibleFeedbacks] = useState(4);
  const [loading, setLoading] = useState(false);

  const handleLoadMore = () => {
    setLoading(true);
    setTimeout(() => {
      setVisibleFeedbacks((prev) => prev + 4);
      setLoading(false);
    }, 1000);
  };

  if (feedbacks.length === 0) {
    return <div className="text-zinc-500">No feedbacks available</div>;
  }

  return (
    <div className="flex divide-y flex-col border rounded-lg overflow-hidden 2xl:max-w-xl">
      {feedbacks.slice(0, visibleFeedbacks).map((feedback) => (
        <Feedback key={feedback.id} feedback={feedback} />
      ))}
      {loading && (
        <div className="space-y-2 p-2">
          <Skeleton className="min-h-16 bg-gray-100" />
          <Skeleton className="min-h-16 bg-gray-100" />
        </div>
      )}
      {feedbacks.length > visibleFeedbacks && !loading && (
        <div
          className="text-center py-2 text-sm hover:bg-gray-50 cursor-pointer text-gray-600"
          onClick={handleLoadMore}
        >
          <span className="">Load more</span>
        </div>
      )}
    </div>
  );
}

// ------------------------------------------ - - - - - - - ->

const actionTypes = [
  "Feedback",
  "Bid",
  "Purchase Request",
  "Profile",
  "Company",
];

// ------------------------------------------ - - - - - - - ->

export function LogEntry({
  entry,
  isFirst,
}: {
  entry: Log;
  isFirst?: boolean;
}) {
  const date = new Date(entry.created_at);
  return (
    <div className="relative z-30 flex hover:bg-zinc-50 hover:border-zinc-100 border border-transparent group my-2 rounded-lg cursor-pointer">
      <div className="absolute left-0 top-0 bottom-0 w-10 flex justify-center">
        <div className="relative">
          <div className="absolute top-3 -translate-x-1/2 rounded-full flex items-center justify-center z-10">
            <ActionBadgeIcon
              className="group-hover:"
              type={entry.action_type}
            />
          </div>
          {!isFirst && (
            <div className="absolute group-hover:opacity-0 transition-all duration-300 top-0 left-1/2 -translate-x-1/2 h-5 w-[1px] bg-gray-100" />
          )}
          <div className="absolute group-hover:opacity-0 transition-all duration-300 top-7 left-1/2 -translate-x-1/2 h-full w-[1px] bg-gray-100" />
        </div>
      </div>
      <div className="flex-1 min-w-0 pl-12 py-2">
        <div className="text-sm text-gray-500 mb-1">
          {date.toLocaleDateString()} {date.toLocaleTimeString()}
        </div>
        <div className="text-gray-900 2xl:text-base text-sm line-clamp-1">
          {entry.action}
        </div>
      </div>
    </div>
  );
}

const LogsComponent = () => {
  const [queryParams, setQueryParams] = useState<{
    page: number;
    limit: number;
  }>({
    page: 1,
    limit: 10,
  });
  const { data: logsData, isLoading } = useGetLogs();

  if (isLoading || !logsData)
    return <div className="text-zinc-500">No logs available</div>;

  return (
    <div className="overflow-hidden">
      {logsData.logs.map((log, index) => (
        <LogEntry key={log.id} entry={log} isFirst={index === 0} />
      ))}
    </div>
  );
};

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <Alert variant="destructive" className="my-4">
          <AlertTitle>Something went wrong</AlertTitle>
          <AlertDescription>
            {this.state.error?.message || "An unexpected error occurred"}
          </AlertDescription>
        </Alert>
      );
    }
    return this.props.children;
  }
}

const LoadingSkeleton = () => (
  <div className="space-y-4">
    <Skeleton className="h-12 w-full" />
    <Skeleton className="h-32 w-full" />
    <Skeleton className="h-32 w-full" />
  </div>
);

const SectionWrapper = ({
  children,
  title,
  isLoading,
  error,
}: {
  children: React.ReactNode;
  title: string;
  isLoading?: boolean;
  error?: Error | null;
}) => {
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error loading {title}</AlertTitle>
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
    );
  }

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <CollapWrapper title={title}>
      <ErrorBoundary>{children}</ErrorBoundary>
    </CollapWrapper>
  );
};

function HistoryComponent({
  profile,
  type,
}: {
  profile: User | Company;
  type: string;
}) {
  const t = useTranslations("historyComponent");
  const { data: me, error: meError, isLoading: meLoading } = useMe();

  // Handle top-level loading state
  if (meLoading) {
    return <LoadingSkeleton />;
  }

  // Handle top-level error state
  if (meError) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Unable to load profile information. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="h-full flex flex-col 2xl:gap-6 gap-4 mb-8 bg-white xl:w-[36rem]">
      <ErrorBoundary>
        <Suspense fallback={<LoadingSkeleton />}>
          {/* Purchase Requests History */}
          {(type === "agent" || type === "supplier") && (
            <CollapWrapper title={t("purchaseRequest.title")}>
              <div className="overflow-hidden rounded-lg">
                <PurchaseRequestsTable type="table" />
              </div>
            </CollapWrapper>
          )}

          {type === "company" && (
            <SectionWrapper title={t("bids.title")}>
              <BidsComponent />
            </SectionWrapper>
          )}

          {(type === "company" || type === "agent") && (
            <>
              <SectionWrapper title={t("feedback.title")}>
                <FeedbackComponent />
              </SectionWrapper>

              {me?.id === profile.id && (
                <SectionWrapper title="Logs">
                  <LogsComponent />
                </SectionWrapper>
              )}
            </>
          )}

          {type === "supplier" && (
            <SectionWrapper title={t("purchaseRequest.title")}>
              <PurchaseRequestsTable type="list" />
            </SectionWrapper>
          )}
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}

export { BidsComponent, FeedbackComponent, HistoryComponent, SectionTitle };
