import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useGetOcpAgents } from "@/endpoints/user/get-ocp-agents";
import { User } from "@/types/entities/index";
import {
  EyeIcon,
  Mail,
  MoreVertical,
  PhoneCall
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { BaseDataTable, Column } from "../shared/BaseDataTable";
import { BasePagination } from "../shared/BasePagination";
import { BaseSearchBar, FilterOption } from "../shared/BaseSearchBar";
import { BelongingCompanyComponent } from "./BelongingCompanyComponent";

interface FilterGroup {
  label: string;
  options: FilterOption[];
  value: string | string[];
  onChange: (value: string | string[]) => void;
}

interface UsersDataTableProps {
  headers: {
    title: string;
    key: string;
    clickable: boolean;
    hidden: boolean;
  }[];
  searchableFields: string[];
}

export function UsersDataTable({
  headers,
  searchableFields,
}: UsersDataTableProps) {
  // Add local pagination state
  const [page, setPage] = useState(1);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [limit, setLimit] = useState(10);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [total, setTotal] = useState(0);

  const { data: fetchedAgents, isLoading } = useGetOcpAgents({
    page,
    limit,
  });

  const [allData, setAllData] = useState<User[]>([]);

  useEffect(() => {
    if (fetchedAgents) {
      const users = Array.isArray(fetchedAgents)
        ? fetchedAgents
        : fetchedAgents.users;

      setAllData(users || []);

      if (fetchedAgents.total) {
        setTotal(fetchedAgents.total);
      }
    }
  }, [fetchedAgents, setTotal]);

  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<keyof User>("username");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [roleFilter, setRoleFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  const filters: FilterGroup[] = [
    {
      label: "Role",
      options: [
        { label: "All Roles", value: "all" },
        { label: "Admin", value: "admin" },
        { label: "User", value: "user" },
      ],
      value: roleFilter || "all",
      onChange: (value) => setRoleFilter(value as string),
    },
    {
      label: "Status",
      options: [
        { label: "All Status", value: "all" },
        { label: "Active", value: "active" },
        { label: "Inactive", value: "inactive" },
      ],
      value: statusFilter || "all",
      onChange: (value) => setStatusFilter(value as string),
    },
  ];

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    // Implement search logic here
  };

  const handleSort = (field: keyof User) => {
    if (sortField === field) {
      // If clicking the same column, toggle direction
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // If clicking a new column, set it as sort field and default to asc
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handlePageChange = useCallback(
    (newPage: number) => {
      setPage(newPage);
    },
    [setPage]
  );

  const columns = headers
    .map((header): Column<User> | undefined => {
      if (header.key === "first_name") {
        return {
          header: header.title,
          accessor: header.key as keyof User,
          hidden: header.hidden,
          clickable: header.clickable,
          render: (value: User[keyof User], item: User) => (
            <Link
              href={`/dashboard/profile/${item.id}`}
              className="flex items-center gap-2 w-fit hover:bg-accent/50 rounded-lg transition-colors"
            >
              <div className="relative">
                <Avatar className="xl:size-12">
                  <AvatarImage
                    src={item.avatar?.url || "/placeholder.webp"}
                    alt={`${item.first_name} ${item.last_name}`}
                  />
                  <AvatarFallback>
                    {item.first_name?.[0]}
                    {item.last_name?.[0]}
                  </AvatarFallback>
                </Avatar>
                {item.status === "offline" && (
                  <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white" />
                )}
              </div>
              <div className="flex flex-col">
                <span className="text-sm xl:text-base font-medium">
                  {item.first_name} {item.last_name}
                </span>
                <span className="text-xs xl:text-sm text-muted-foreground">
                  {item.email}
                </span>
                <span className="text-xs text-muted-foreground hidden xl:block">
                  {item.title}
                </span>
              </div>
            </Link>
          ),
        };
      }
      if (header.key === "actions") {
        return {
          header: header.title,
          accessor: header.key as keyof User,
          hidden: header.hidden,
          clickable: header.clickable,
          render: (_: User[keyof User], item: User) => (
            <div className="flex items-center justify-end">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[160px]">
                  <DropdownMenuItem
                    onClick={() =>
                      (window.location.href = `tel:${item.phone_number}`)
                    }
                  >
                    <PhoneCall className="mr-2 h-4 w-4" />
                    <span>Call</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() =>
                      (window.location.href = `mailto:${item.email}`)
                    }
                  >
                    <Mail className="mr-2 h-4 w-4" />
                    <span>Email</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() =>
                      (window.location.href = `/dashboard/profile/${item.id}`)
                    }
                  >
                    <EyeIcon className="mr-2 h-4 w-4" />
                    <span>View Profile</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ),
        };
      }
      if (header.key === "last_name") {
        return undefined;
      }
      if (header.key === "company_id") {
        return {
          header: header.title,
          accessor: header.key as keyof User,
          hidden: header.hidden,
          clickable: header.clickable,
          render: (_: User[keyof User], item: User) => (
            <BelongingCompanyComponent user={item} companyId={item.id} />
          ),
        };
      }
      return {
        header: header.title,
        accessor: header.key as keyof User,
        hidden: header.hidden,
        clickable: header.clickable,
      };
    })
    .filter((col): col is Column<User> => col !== undefined);

  // Filter items based on search term
  const filteredItems = useMemo(() => {
    if (!allData.length) return [];

    return allData.filter((item) => {
      const matchesSearch =
        !searchTerm ||
        searchableFields.some((field) =>
          String(item[field as keyof User])
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
        );

      const matchesRole =
        roleFilter === "all" ||
        !roleFilter ||
        (item.roles && item.roles.includes(roleFilter));
      const matchesStatus =
        statusFilter === "all" || !statusFilter || item.status === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [allData, searchTerm, searchableFields, roleFilter, statusFilter]);

  // Add sortedData before pagination
  const sortedData = useMemo(() => {
    return [...filteredItems].sort((a, b) => {
      if (!sortField) return 0;

      const aValue = a[sortField] ?? "";
      const bValue = b[sortField] ?? "";

      // Handle string comparison
      if (typeof aValue === "string" && typeof bValue === "string") {
        const comparison = aValue.localeCompare(bValue);
        return sortDirection === "asc" ? comparison : -comparison;
      }

      // Handle number comparison
      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredItems, sortField, sortDirection]);

  // Update the paginatedData to use sortedData instead of filteredItems
  const paginatedData = useMemo(() => {
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    return sortedData.slice(startIndex, endIndex);
  }, [sortedData, page, limit]);

  // Calculate total pages
  const totalPages = Math.ceil((fetchedAgents?.total || 0) / limit);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
        <BaseSearchBar
          onSearch={handleSearch}
          placeholder="Search users..."
          filters={filters as FilterGroup[] || []}
          className="md:w-1/2 w-full"
        />
        {/* <p className="text-sm text-muted-foreground order-3 md:order-2">
          Showing {paginatedData.length} of {filteredItems.length} items
        </p> */}
      </div>

      <div className="bg-card rounded-lg border shadow-sm">
        <BaseDataTable<User>
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
            currentPage={page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
    </div>
  );
}
