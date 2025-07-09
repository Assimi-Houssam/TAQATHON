"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import React from "react";
import { PurchaseRequest } from "@/types/EntityProfile";

// Table Header Component
const TableHeaderComponent: React.FC = () => (
  <TableHeader className="">
    <TableRow className="*:py-4">
      <TableHead className="font-semibold 2xl:w-52 w-32">Reference</TableHead>
      <TableHead className="font-semibold">Title</TableHead>
      <TableHead className="font-semibold hidden xl:table-cell">Date</TableHead>
      <TableHead className="font-semibold text-right">Actions</TableHead>
    </TableRow>
  </TableHeader>
);

// Table Row Component
const TableRowComponent: React.FC<{
  row: PurchaseRequest;
  index: number;
  openRow: number | null;
  toggleRow: (rowIndex: number) => void;
}> = ({ row, index, openRow, toggleRow }) => (
  <React.Fragment key={index}>
    <TableRow key={`row-${index}`}>
      <TableCell className="font-light 2xl:text-lg text-base text-blue-600">
        {row.reference}
      </TableCell>
      <TableCell>{row.title}</TableCell>
      <TableCell className="hidden xl:table-cell">{row.date}</TableCell>
      <TableCell className="text-right">
        <Button
          className="hover:bg-transparent"
          variant="ghost"
          onClick={() => toggleRow(index)}
        >
          View Details
          <ChevronDown
            className={`ml-2 h-4 w-4 transition-transform duration-200 ${
              openRow === index ? "rotate-180" : ""
            }`}
          />
        </Button>
      </TableCell>
    </TableRow>
    {openRow === index && (
      <TableRow key={`details-${index}`}>
        <TableCell colSpan={4} className="bg-muted/50 p-4">
          <div className="space-y-2">
            <h3 className="font-semibold">Request Details</h3>
            <p className="text-sm text-muted-foreground 2xl:max-w-2xl max-w-lg line-clamp-1">
              {row.details}
            </p>
          </div>
        </TableCell>
      </TableRow>
    )}
  </React.Fragment>
);

const PurchaseHistoryComponentAsTable: React.FC<{
  data: PurchaseRequest[];
  openRow: number | null;
  toggleRow: (rowIndex: number) => void;
}> = ({ data, openRow, toggleRow }) => {
  if (data.length === 0) {
    return <div className="text-gray-500">No purchase requests found.</div>;
  }
  return (
    <div className="rounded-md w-full border flex flex-col-reverse overflow-hidden ">
      <Table>
        <TableHeaderComponent />
        <TableBody>
          {data.map((row, index) => (
            <TableRowComponent
              key={index}
              row={row}
              index={index}
              openRow={openRow}
              toggleRow={toggleRow}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

const PurchaseHistoryComponentAsList: React.FC<{ data: PurchaseRequest[] }> = ({
  data,
}) => {
  if (data.length === 0) {
    return <div className="text-gray-500">No purchase requests found.</div>;
  }
  return (
    <div className="flex flex-col gap-4 max-w-xl">
      {data.map((row, index) => (
        <div key={index} className="rounded-md border p-4">
          <div className="flex justify-between">
            <div>
              <h3 className="font-semibold text-lg text-blue-600">
                {row.reference}
              </h3>
              <p className="text-sm text-muted-foreground">{row.title}</p>
            </div>
          </div>
          <div className="mt-2">
            <p className="font-thin text-muted-foreground line-clamp-1">
              {row.details}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export function PurchaseRequestsTable({ type }: { type: "table" | "list" }) {
  const [openRow, setOpenRow] = useState<number | null>(null);
  const toggleRow = (rowIndex: number) => {
    setOpenRow(openRow === rowIndex ? null : rowIndex);
  };
  const data: PurchaseRequest[] = [];
  if (type === "list") {
    return <PurchaseHistoryComponentAsList data={data} />;
  }
  return (
    <PurchaseHistoryComponentAsTable
      data={data}
      openRow={openRow}
      toggleRow={toggleRow}
    />
  );
}
