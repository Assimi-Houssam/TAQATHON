"use client";

import { PurchaseRequestInfo } from "@/app/api/purchase-requests/route";
import { Pagination } from "@/components/ui/public-requests/Pagination";
import { RequestCard } from "@/components/ui/public-requests/RequestCard";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

interface APIResponse {
  content: PurchaseRequestInfo[];
  count: number;
}

const fetchPurchaseRequests = async (page: number): Promise<APIResponse> => {
  const response = await fetch(`/api/purchase-requests?page=${page}`);
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  return response.json();
};

export function PublicRequestsList() {
  const [currentPage, setCurrentPage] = useState(0);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["purchaseRequests", currentPage],
    queryFn: () => fetchPurchaseRequests(currentPage),
    placeholderData: (previousData) => previousData,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex justify-center items-center h-96">
        Error: {(error as Error).message}
      </div>
    );
  }

  const requests = data?.content || [];

  return (
    <section className="container mx-auto px-4 sm:px-6 pt-24 sm:pt-32">
      {/* <SearchFilters requests={requests} /> */}

      <div className="space-y-4">
        {requests.map((request) => (
          <RequestCard key={request.opportunityId} request={request} />
        ))}
      </div>
      <div className="p-4">
        <Pagination
          currentPage={currentPage}
          totalCount={data?.count || 0}
          pageSize={requests.length}
          onPageChange={setCurrentPage}
        />
      </div>
    </section>
  );
}
