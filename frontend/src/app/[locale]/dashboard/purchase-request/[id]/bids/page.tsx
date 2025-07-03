"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ErrorCard } from "@/components/ui/error-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetPurchaseRequestByRef } from "@/endpoints/purchase-requests/purchase-requests";
import { cn } from "@/lib/utils";
import { AxiosError } from "axios";
import { motion } from "framer-motion";
import { useParams } from "next/navigation";
import { Suspense } from "react";
import { BidsTable } from "./components/bids-table";
import { PurchaseRequestHeader } from "./components/purchase-request-header";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

const sharedCardStyles = {
  card: "bg-white/90 backdrop-blur-md border border-zinc-200/50 overflow-hidden transition-all duration-200",
  cardHeader: "border-b border-zinc-100/50 py-6 px-6",
  cardTitle: "text-lg font-semibold text-zinc-900",
  cardContent: "p-6",
};

export default function PurchaseRequestBidsPage() {
  const { id: purchaseRequestRef } = useParams();
  const {
    data: purchaseRequest,
    isLoading: isLoadingPurchaseRequest,
    error,
  } = useGetPurchaseRequestByRef(purchaseRequestRef as string);

  if (isLoadingPurchaseRequest) {
    return (
      <div className="container mx-auto p-4 max-w-7xl space-y-6">
        <Card className={sharedCardStyles.card}>
          <CardHeader className={sharedCardStyles.cardHeader}>
            <Skeleton className="h-8 w-64" />
          </CardHeader>
          <CardContent className={sharedCardStyles.cardContent}>
            <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </CardContent>
        </Card>

        <Card className={sharedCardStyles.card}>
          <CardHeader className={sharedCardStyles.cardHeader}>
            <Skeleton className="h-8 w-48" />
          </CardHeader>
          <CardContent className={sharedCardStyles.cardContent}>
            <BidsTableSkeleton />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error instanceof AxiosError) {
    return (
      <div className="container mx-auto p-4 max-w-7xl">
        <ErrorCard
          title={
            error.response?.data.message || "Error Loading Purchase Request"
          }
          variant="error"
          backUrl="/dashboard/purchase-request"
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  if (!purchaseRequest) {
    return (
      <div className="container mx-auto p-4 max-w-7xl">
        <ErrorCard
          title="Purchase Request Not Found"
          variant="warning"
          backUrl="/dashboard/purchase-request"
        />
      </div>
    );
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="container mx-auto p-4 max-w-7xl space-y-6 relative"
    >
      <motion.div variants={item}>
        <PurchaseRequestHeader
          purchaseRequest={purchaseRequest}
          styles={sharedCardStyles}
        />
      </motion.div>

      <motion.div variants={item}>
        <Card className={sharedCardStyles.card}>
          <CardHeader
            className={cn(
              "flex flex-row items-center justify-between",
              sharedCardStyles.cardHeader
            )}
          >
            <CardTitle className={sharedCardStyles.cardTitle}>
              Bids Overview
            </CardTitle>
          </CardHeader>
          <CardContent className={sharedCardStyles.cardContent}>
            <Suspense fallback={<BidsTableSkeleton />}>
              <BidsTable purchaseRequestId={Number(purchaseRequest.id)} />
            </Suspense>
          </CardContent>
        </Card>
      </motion.div>

      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-emerald-500/[0.02] rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-emerald-500/[0.02] rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-500/[0.02] rounded-full blur-3xl animate-pulse delay-500" />
        <div className="absolute inset-0 bg-grid-white/[0.015] bg-[size:20px_20px]" />
      </div>
    </motion.div>
  );
}

function BidsTableSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-12 w-full bg-gray-200/50" />
      <Skeleton className="h-12 w-full bg-gray-200/50" />
      <Skeleton className="h-12 w-full bg-gray-200/50" />
      <Skeleton className="h-12 w-full bg-gray-200/50" />
      <Skeleton className="h-12 w-full bg-gray-200/50" />
    </div>
  );
}

export type sharedCardStyles = {
  card: string;
  cardHeader: string;
  cardTitle: string;
  cardContent: string;
};
