"use client";

import { BidsDataTable } from "@/components/ui/ocp/layout/OCPDataTable-new";

const headers = [
  {
    title: "Company",
    key: "company",
    clickable: true,
    hidden: false,
  },
  {
    title: "Status",
    key: "bid_status",
    clickable: true,
    hidden: false,
    filterType: "select",
  },
  {
    title: "Description",
    key: "bid_description",
    clickable: true,
    hidden: false,
  },
  {
    title: "Delivery Date",
    key: "delivery_date",
    clickable: true,
    hidden: false,
    filterType: "date",
  },
  {
    title: "Created At",
    key: "created_at",
    clickable: true,
    hidden: false,
    filterType: "date",
  },
];

const searchableFields = ["bid_description", "company.commercial_name"];

export function BidsTable({
  purchaseRequestId,
}: {
  purchaseRequestId: number;
}) {
  return (
    <BidsDataTable
      headers={headers}
      searchableFields={searchableFields}
      purchaseRequestId={purchaseRequestId}
    />
  );
}
