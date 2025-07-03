import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bid } from "@/types/entities/index";
import { CircleCheck, AlertCircle, XCircle } from "lucide-react";
import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import { BaseDataTable, Column } from "../shared/BaseDataTable";
import { BasePagination } from "../shared/BasePagination";
import { BaseSearchBar, FilterOption } from "../shared/BaseSearchBar";
import { Badge } from "@/components/ui/badge";
import { BidStatus } from "@/types/entities/enums/index.enum";
import { cn } from "@/lib/utils";
import { useGetAllBids } from "@/endpoints/bids/get-all-bids";

interface FilterGroup {
  label: string;
  options: FilterOption[];
  value: string | string[];
  onChange: (value: string | string[]) => void;
}

interface BidsDataTableProps {
  headers: {
    title: string;
    key: string;
    clickable: boolean;
    hidden: boolean;
  }[];
  searchableFields: string[];
  purchaseRequestId: number;
}

export function BidsDataTable({
  headers,
  searchableFields,
  purchaseRequestId,
}: BidsDataTableProps) {
  /* eslint-disable */
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const { data: fetchedBids, isLoading } = useGetAllBids({
    page,
    limit, 
    purchaseRequestId,
  });
  /* eslint-enable */

  const [allData, setAllData] = useState<Bid[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<keyof Bid>("created_at");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  useEffect(() => {
    if (fetchedBids) {
      setAllData((prev) => {
        const newData = [...prev];
        fetchedBids.bids.forEach((bid: Bid) => {
          if (!newData.some((existing) => existing.id === bid.id)) {
            newData.push(bid);
          }
        });
        return newData;
      });

      if (fetchedBids.bids.length) {
        setTotal(fetchedBids.bids.length);
      }
    }
  }, [fetchedBids, setTotal]);

  useEffect(() => {
    if (fetchedBids?.total) {
      setTotal(fetchedBids.total);
    }
  }, [fetchedBids?.total]);

  const filters: FilterGroup[] = [
    {
      label: "Status",
      options: [
        { label: "All Status", value: "all" },
        { label: "Pending", value: BidStatus.PENDING },
        { label: "Awarded", value: BidStatus.AWARDED },
        { label: "Disqualified", value: BidStatus.DISQUALIFIED },
      ],
      value: statusFilter || "all",
      onChange: (value) => setStatusFilter(value as string),
    },
  ];

  const columns = headers
    .map((header): Column<Bid> => {
      switch (header.key) {
        case "company":
          return {
            header: header.title,
            accessor: header.key as keyof Bid,
            hidden: header.hidden,
            clickable: header.clickable,
            render: (value: unknown, item: Bid) => (
              <Link
                className="flex items-center gap-2 w-fit hover:bg-accent/50 rounded-lg transition-colors"
                href={`/dashboard/bids/${item.id}`}
              >
                <Avatar className="xl:size-12 relative">
                  <AvatarImage
                    src={item.company?.logo || "/placeholder.webp"}
                    alt={`${item.company?.commercial_name}`}
                  />
                  <AvatarFallback>
                    {item.company?.commercial_name?.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-sm xl:text-base font-medium">
                    {item.company?.commercial_name}
                  </span>
                  <span className="text-xs xl:text-sm text-muted-foreground">
                    Bid #{item.id}
                  </span>
                </div>
              </Link>
            ),
          };

        case "bid_status":
          return {
            header: header.title,
            accessor: header.key as keyof Bid,
            hidden: header.hidden,
            clickable: header.clickable,
            render: (_: unknown, item: Bid) => {
              const statusConfig: Record<
                BidStatus,
                { color: string; icon: React.ReactNode }
              > = {
                [BidStatus.PENDING]: {
                  color: "bg-yellow-100 text-yellow-800 border-yellow-200",
                  icon: <AlertCircle className="h-3 w-3" />,
                },
                [BidStatus.AWARDED]: {
                  color: "bg-green-100 text-green-800 border-green-200",
                  icon: <CircleCheck className="h-3 w-3" />,
                },
                [BidStatus.DISQUALIFIED]: {
                  color: "bg-red-100 text-red-800 border-red-200",
                  icon: <XCircle className="h-3 w-3" />,
                },
                [BidStatus.EXPIRED]: {
                  color: "bg-gray-100 text-gray-800 border-gray-200",
                  icon: <XCircle className="h-3 w-3" />,
                },
              };

              const config = statusConfig[item.bid_status || BidStatus.PENDING];

              return (
                <Badge
                  variant="outline"
                  className={cn(
                    "capitalize flex items-center gap-1.5",
                    config.color
                  )}
                >
                  {config.icon}
                  {item.bid_status?.toLowerCase() ||
                    BidStatus.PENDING.toLowerCase()}
                </Badge>
              );
            },
          };

        case "bid_description":
          return {
            header: header.title,
            accessor: header.key as keyof Bid,
            hidden: header.hidden,
            clickable: header.clickable,
            render: (value: unknown) => (
              <span className="line-clamp-2 max-w-md">{value as string}</span>
            ),
          };

        case "delivery_date":
        case "biding_date":
        case "created_at":
        case "updated_at":
          return {
            header: header.title,
            accessor: header.key as keyof Bid,
            hidden: header.hidden,
            clickable: header.clickable,
            render: (value: unknown) => {
              if (!value) return "-";
              return new Date(value as string).toLocaleDateString(undefined, {
                year: "numeric",
                month: "short",
                day: "numeric",
              });
            },
          };

        case "delivery_address":
        case "biding_address":
          return {
            header: header.title,
            accessor: header.key as keyof Bid,
            hidden: header.hidden,
            clickable: header.clickable,
            render: (value: unknown) => (
              <span className="line-clamp-1 max-w-xs">{value as string}</span>
            ),
          };

        default:
          return {
            header: header.title,
            accessor: header.key as keyof Bid,
            hidden: header.hidden,
            clickable: header.clickable,
          };
      }
    })
    .filter((col): col is Column<Bid> => col !== undefined);

  // Memoize derived states
  const filteredItems = useMemo(() => {
    if (!allData.length) return [];

    return allData.filter((item: Bid) => {
      const matchesSearch =
        !searchTerm ||
        searchableFields.some((field) =>
          String(item[field as keyof Bid])
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
        );

      const matchesStatus =
        statusFilter === "all" ||
        !statusFilter ||
        String(item.bid_status) === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [allData, searchTerm, searchableFields, statusFilter]);

  // Add sortedData before pagination
  const sortedData = useMemo(() => {
    if (!filteredItems) return [];
    return [...filteredItems].sort((a, b) => {
      if (!sortField) return 0;

      const aValue = String(a[sortField] ?? "");
      const bValue = String(b[sortField] ?? "");

      // Now aValue and bValue are definitely strings
      const comparison = aValue.localeCompare(bValue);
      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [filteredItems, sortField, sortDirection]);

  // Update the paginatedData to use sortedData instead of filteredItems
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return sortedData.slice(startIndex, endIndex);
  }, [sortedData, currentPage, itemsPerPage]);

  // Calculate total pages
  const totalPages = Math.ceil(allData.length / itemsPerPage);

  const handleSort = (field: keyof Bid) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
        <BaseSearchBar
          onSearch={setSearchTerm}
          placeholder="Search bids..."
          filters={filters as FilterGroup[] || []}
          className="w-full"
        />
      </div>

      <div className="bg-card rounded-lg border shadow-sm">
        <BaseDataTable<Bid>
          data={paginatedData}
          columns={columns}
          onSort={handleSort}
          sortField={sortField}
          sortDirection={sortDirection}
          loading={false}
          className="[&_th]:bg-muted/50 [&_th]:text-muted-foreground"
        />
        <div className="border-t p-4 flex items-center justify-end">
          <BasePagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
    </div>
  );
}
