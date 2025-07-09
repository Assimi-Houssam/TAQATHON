"use client";

import clsx from "clsx";
import Link from "next/link";

interface BidData {
  id: number;
  name: string;
  date: string;
  price: number;
  status: string;
}

interface BidProps {
  bid: BidData;
}

const Bid = ({ bid }: BidProps) => {
  return (
    <div className="flex items-center justify-between rounded-lg p-4 bg-gray-100 group transition-all">
      <div className="flex flex-col justify-center gap-2">
        <h1 className="font-semibold group-hover:underline">
          <Link href={`/bids/${bid.id}`}>{bid.name}</Link>
        </h1>
        <h2 className="text-sm text-gray-500">{bid.date.toLocaleString()}</h2>
      </div>
      <div className="flex flex-col items-end justify-center gap-2">
        <h1 className="font-semibold">${bid.price.toLocaleString()}</h1>
        <h2
          className={clsx("text-sm", {
            "text-blue-500": bid.status === "Won",
            "text-red-500": bid.status === "Lost",
          })}
        >
          {bid.status}
        </h2>
      </div>
    </div>
  );
};

export { Bid };
export type { BidData };
