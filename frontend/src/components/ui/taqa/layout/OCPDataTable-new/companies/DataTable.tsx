import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Company } from "@/types/entities/index";
import { CircleCheck, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import { BaseDataTable, Column } from "../shared/BaseDataTable";
import { BasePagination } from "../shared/BasePagination";
import { BaseSearchBar, FilterOption } from "../shared/BaseSearchBar";
import { Badge } from "@/components/ui/badge";
import { CompanyStatus } from "@/types/entities/enums/index.enum";
import { cn } from "@/lib/utils";
import { useGetAllCompanies } from "@/endpoints/company/get-all-companies";

interface FilterGroup {
  label: string;
  options: FilterOption[];
  value: string | string[];
  onChange: (value: string | string[]) => void;
}

interface CompaniesDataTableProps {
  headers: {
    title: string;
    key: string;
    clickable: boolean;
    hidden: boolean;
  }[];
  searchableFields: string[];
}

export function CompaniesDataTable({
  headers,
  searchableFields,
}: CompaniesDataTableProps) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [page, setPage] = useState(1);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [limit, setLimit] = useState(10);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [total, setTotal] = useState(0);

  const { data: fetchedCompanies, isLoading } = useGetAllCompanies({
    page,
    limit,
    approved: true,
  });

  const [allData, setAllData] = useState<Company[]>([]);

  useEffect(() => {
    if (fetchedCompanies?.companies) {
      // Accumulate data instead of replacing
      setAllData((prev) => {
        const newData = [...prev];
        fetchedCompanies.companies.forEach((company: Company) => {
          if (!newData.some((existing) => existing.id === company.id)) {
            newData.push(company);
          }
        });
        return newData;
      });

      // update the total count
      if (fetchedCompanies.total) {
        setTotal(fetchedCompanies.total);
      }
    }
  }, [fetchedCompanies, setTotal]);

  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<keyof Company>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  const filters: FilterGroup[] = [
    {
      label: "Status",
      options: [
        { label: "All Status", value: "all" },
        { label: "Approved", value: "true" },
        { label: "Pending", value: "false" },
      ],
      value: statusFilter ?? "all",
      onChange: (value) => {
        setStatusFilter(value as string);
      },
    },
  ];

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const handleSort = (field: keyof Company) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const columns = headers
    .map((header): Column<Company> => {
      if (header.key === "commercial_name") {
        return {
          header: header.title,
          accessor: header.key as keyof Company,
          hidden: header.hidden,
          clickable: header.clickable,
          render: (value: unknown, item: Company) => (
            <Link
              className="flex items-center gap-2 w-fit hover:bg-accent/50 rounded-lg transition-colors"
              href={`/dashboard/companies/${item.id}`}
            >
              <Avatar className="xl:size-12 relative">
                <AvatarImage
                  src={item.logo || "/placeholder.webp"}
                  alt={`${item.commercial_name}`}
                />
                <AvatarFallback>
                  {item.commercial_name?.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm xl:text-base font-medium">
                  {item.commercial_name}
                </span>
                <span className="text-xs xl:text-sm text-muted-foreground">
                  {item.business_scopes.slice(0, 3).join(", ")}
                </span>
              </div>
            </Link>
          ),
        };
      }
      if (header.key === "status") {
        return {
          header: header.title,
          accessor: header.key as keyof Company,
          hidden: header.hidden,
          clickable: header.clickable,
          render: (_: unknown, item: Company) => {
            const statusConfig: Record<
              CompanyStatus,
              { color: string; icon: React.ReactNode }
            > = {
              [CompanyStatus.ACTIVE]: {
                color: "bg-green-100 text-green-800 border-green-200",
                icon: <CircleCheck className="h-3 w-3" />,
              },
              [CompanyStatus.LOCKED]: {
                color: "bg-yellow-100 text-yellow-800 border-yellow-200",
                icon: <AlertCircle className="h-3 w-3" />,
                              },
            };

            const config = statusConfig[item.status || CompanyStatus.ACTIVE];

            return (
              <Badge
                variant="outline"
                className={cn(
                  "capitalize flex items-center gap-1.5",
                  config.color
                )}
              >
                {config.icon}
                {item.status?.toLowerCase() ||
                  CompanyStatus.ACTIVE.toLowerCase()}
              </Badge>
            );
          },
        };
      }
      return {
        header: header.title,
        accessor: header.key as keyof Company,
        hidden: header.hidden,
        clickable: header.clickable,
      };
    })
    .filter((col): col is Column<Company> => col !== undefined);

  // Memoize derived states
  const filteredItems = useMemo(() => {
    if (!allData.length) return [];

    return allData.filter((item: Company) => {
      const matchesSearch =
        !searchTerm ||
        searchableFields.some((field) =>
          String(item[field as keyof Company])
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
        );

      const matchesStatus =
        statusFilter === "all" ||
        !statusFilter ||
        String(item.approved) === statusFilter;

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
        <BaseSearchBar
          onSearch={handleSearch}
          placeholder="Search companies..."
          filters={filters as FilterGroup[] || []}
          className="md:w-1/2 w-full"
        />
        {/* <p className="text-sm text-muted-foreground order-3 md:order-2">
          Showing {paginatedData.length} of {filteredItems?.length || 0} items
        </p> */}
      </div>

      <div className="bg-card rounded-lg border shadow-sm">
        <BaseDataTable<Company>
          data={paginatedData}
          columns={columns}
          onSort={handleSort}
          sortField={sortField}
          sortDirection={sortDirection}
          loading={isLoading}
          className="[&_th]:bg-muted/50 [&_th]:text-muted-foreground"
        />
        <div className="border-t p-4 flex items-center justify-end">
          <BasePagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
    </div>
  );
}
