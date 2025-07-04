"use client";

import { ExternalLink, X } from "lucide-react";
import { useEffect, useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import clsx from "clsx";

const bids = [
  {
    id: 1,
    company: "TechCorp Solution",
    bidNumber: "#bid_325_2134",
    balance: "$0.00/$10,222.45",
    date: "17/11/2024",
    description: "Hardware for the office",
  },
  {
    id: 2,
    company: "TechCorp Solution",
    bidNumber: "#bid_325_2134",
    balance: "$0.00/$10,222.45",
    date: "17/11/2024",
    description: "Hardware for the office",
  },
  {
    id: 3,
    company: "TechCorp Solution",
    bidNumber: "#bid_325_2134",
    balance: "$0.00/$10,222.45",
    date: "17/11/2024",
    description: "Hardware for the office",
  },
  {
    id: 4,
    company: "TechCorp Solution",
    bidNumber: "#bid_325_2134",
    balance: "$0.00/$10,222.45",
    date: "17/11/2024",
    description: "Hardware for the office",
  },
];

const invoices = [
  {
    id: 1,
    companyName: "MARVIN LTD",
    regNumber: "REG: 821478210293",
    contact: "hi@blocksdesign.co | +64 123 1234 123",
    invoiceNumber: "INV-0512",
    invoiceDate: "10 Feb 2023",
    dueDate: "20 Feb 2023",
    items: [
      {
        description: '27" 2K UHD Monitor',
        qty: 14,
        price: 599.9,
        gst: 0.0,
        amount: 8398.6,
      },
      {
        description: "KB990 Keyboard",
        qty: 23,
        price: 49.95,
        gst: 0.0,
        amount: 1148.55,
      },
      {
        description: "Wireless Mouse MS1293W",
        qty: 23,
        price: 24.95,
        gst: 0.0,
        amount: 573.95,
      },
    ],
    subtotal: 10421.1,
    gst: 0.0,
    total: 10421.1,
    paymentInstructions: {
      bankName: "ABC Bank Limited",
      swift: "NZ0201230012",
      accountNumber: "12-1234-123456-12",
    },
  },
];

function InvoiceTemplate({ invoice }: { invoice: (typeof invoices)[0] }) {
  return (
    <div className="bg-white">
      <div className="flex flex-col sm:flex-row justify-between items-start mb-8">
        <div>
          <h2 className="text-2xl font-bold">INVOICE</h2>
          <p className="text-gray-600">{invoice.companyName}</p>
          <p className="text-gray-600">{invoice.regNumber}</p>
          <p className="text-gray-600">{invoice.contact}</p>
        </div>
        <div className="text-left sm:text-right mt-4 sm:mt-0">
          <p>
            <strong>INVOICE NUMBER:</strong> {invoice.invoiceNumber}
          </p>
          <p>
            <strong>INVOICE DATE:</strong> {invoice.invoiceDate}
          </p>
          <p>
            <strong>DUE:</strong> {invoice.dueDate}
          </p>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Description</TableHead>
            <TableHead className="text-right">Qty</TableHead>
            <TableHead className="text-right">Price</TableHead>
            <TableHead className="text-right">GST</TableHead>
            <TableHead className="text-right">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoice.items.map((item, index) => (
            <TableRow key={index}>
              <TableCell>{item.description}</TableCell>
              <TableCell className="text-right">{item.qty}</TableCell>
              <TableCell className="text-right">
                ${item.price.toFixed(2)}
              </TableCell>
              <TableCell className="text-right">
                ${item.gst.toFixed(2)}
              </TableCell>
              <TableCell className="text-right">
                ${item.amount.toFixed(2)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="mt-8 text-right">
        <p>
          <strong>Sub total (excl. GST):</strong> ${invoice.subtotal.toFixed(2)}
        </p>
        <p>
          <strong>Total GST:</strong> ${invoice.gst.toFixed(2)}
        </p>
        <p className="text-xl font-bold mt-4">
          <strong>Amount due on {invoice.dueDate}:</strong> $
          {invoice.total.toFixed(2)}
        </p>
      </div>

      <div className="mt-8 border-t pt-4">
        <h3 className="font-bold mb-2">PAYMENT INSTRUCTIONS</h3>
        <p>
          <strong>{invoice.companyName}</strong>
        </p>
        <p>Bank name: {invoice.paymentInstructions.bankName}</p>
        <p>SWIFT/IBAN: {invoice.paymentInstructions.swift}</p>
        <p>Account number: {invoice.paymentInstructions.accountNumber}</p>
        <p>Please use {invoice.invoiceNumber} as a reference number</p>
      </div>

      <div className="mt-4">
        <Button variant="outline" className="flex items-center">
          Pay online{" "}
          <ExternalLink className="ml-2 h-4 w-4" aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}

const BidRowContentComponent = ({
  company,
  bidNumber,
  balance,
  date,
  description,
}: (typeof bids)[0]) => {
  const BidContentAttributes = [
    {
      label: "Balance",
      value: balance,
    },
    {
      label: "Date",
      value: date,
    },
    {
      label: "Description",
      value: description,
    },
  ];

  return (
    <div className="w-full flex flex-col">
      <h1 className="2xl:text-lg font-medium">{company}</h1>
              <h2 className="text-xs 2xl:text-base text-blue-500">
        {bidNumber}
      </h2>
      <div className="py-1 text-xxs 2xl:text-sm text-gray-500 flex flex-col gap-1 max-w-sm">
        {BidContentAttributes.map((attr, index) => (
          <div key={index} className="flex gap-1">
            <div className="font-light line-clamp-1">{attr.label}:</div>
            <div className="font-medium line-clamp-1">{attr.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

const BidRowTriggerComponent = ({
  bid,
  selectedBid,
  toggleBid,
}: {
  bid: (typeof bids)[0];
  selectedBid: number | null;
  toggleBid: (bidId: number) => void;
}) => {
  return (
    <div className="w-fit">
      <div
        onClick={() => toggleBid(bid.id)}
        className="flex justify-center items-center p-1 hover:bg-gray-100 rounded cursor-pointer"
      >
        {selectedBid !== bid.id ? (
          <ExternalLink
                          className="size-4 text-blue-600"
            aria-hidden="true"
          />
        ) : (
                      <X className="size-4 text-blue-600" />
        )}
      </div>
    </div>
  );
};

const BidRowAvatarComponent = ({ img }: { img: string }) => {
  return (
    <div className="w-fit">
      <Avatar className="rounded-md size-16">
        <AvatarImage src={img} />
        <AvatarFallback>BD</AvatarFallback>
      </Avatar>
    </div>
  );
};

const BidRow = ({
  bid,
  selectedBid,
  toggleBid,
}: {
  bid: (typeof bids)[0];
  selectedBid: number | null;
  toggleBid: (bidId: number) => void;
}) => {
  return (
    <div
      key={bid.id}
      className={clsx(
        "border p-4 rounded flex gap-4 justify-between transition-all duration-300 select-none",
        selectedBid === bid.id &&
          "bg-gray-100 border-b-4 border-b-green-500 rounded-lg"
      )}
    >
      <BidRowAvatarComponent img="/placeholder.webp" />
      <BidRowContentComponent {...bid} />
      <BidRowTriggerComponent
        bid={bid}
        selectedBid={selectedBid}
        toggleBid={toggleBid}
      />
    </div>
  );
};

const BidComponent = ({
  selectedBid,
  setSelectedBid,
}: {
  selectedBid: number | null;
  setSelectedBid: (bidId: number | null) => void;
}) => {
  const toggleBid = (bidId: number) => {
    setSelectedBid(selectedBid === bidId ? null : bidId);
  };
  return (
    <div className="2xl:min-w-[32rem] min-w-[20rem]">
      <Card className="border-none p-0 px-0">
        <CardContent className="p-0 px-0">
          <ScrollArea className="h-full">
            <div className="grid grid-cols-1 gap-4">
              {bids.map((bid) => (
                <BidRow
                  key={bid.id}
                  bid={bid}
                  selectedBid={selectedBid}
                  toggleBid={toggleBid}
                />
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

const InvoiceComponent = ({ selectedBid }: { selectedBid: number | null }) => {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedBid !== null) {
      setLoading(true);
      const timer = setTimeout(() => {
        setLoading(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [selectedBid]);

  return (
    <div className="w-full">
      <Card className="rounded min-h-[16rem]">
        <CardHeader className="">
          <CardTitle>Invoice</CardTitle>
        </CardHeader>
        <CardContent className="">
          <ScrollArea className="">
            {loading ? (
              <div className="animate-pulse py-12 flex gap-4 flex-col justify-center">
                <div className="size-32 w-32 bg-gray-200 rounded"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </div>
            ) : selectedBid ? (
              <InvoiceTemplate invoice={invoices[0]} />
            ) : (
              <p className="text-center text-gray-500">
                Select a bid to view its invoice
              </p>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

function BidsAndInvoices() {
  const [selectedBid, setSelectedBid] = useState<number | null>(null);
  return (
    <div className="h-full">
      <h1 className="text-2xl font-bold">Bids and Invoices</h1>
      <div className="flex flex-col lg:flex-row gap-4 py-4">
        <BidComponent
          selectedBid={selectedBid}
          setSelectedBid={setSelectedBid}
        />
        <InvoiceComponent selectedBid={selectedBid} />
      </div>
    </div>
  );
}

export { BidsAndInvoices };
