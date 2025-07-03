"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ExpandedRow } from "@/components/ui/purchase-requests/expanded-row";
import { TableSkeleton } from "@/components/ui/purchase-requests/skeletons";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useGetPurchaseRequests } from "@/endpoints/purchase-requests/purchase-requests";
import { PurchaseRequest } from "@/types/entities";
import { PurchaseRequestStatus } from "@/types/entities/enums/index.enum";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Eye,
  FileText,
  Search,
} from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { Fragment, useState } from "react";

// Filter Components
const SearchFilters = ({
  searchQuery,
  setSearchQuery,
  setDepartmentFilter,
  setCategoryFilter,
  setParentCategoryFilter,
  data,
}: {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  setDepartmentFilter: (filter: string) => void;
  setCategoryFilter: (filter: string) => void;
  setParentCategoryFilter: (filter: string) => void;
  data?: PurchaseRequest[];
}) => {
  const t = useTranslations("dataTable");

  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        duration: 0.6,
        ease: "easeOut",
      }}
      className="border rounded-lg p-6 bg-white shadow-sm"
    >
      <div className="flex items-start gap-3 mb-4">
        <AlertCircle className="text-gray-500 mt-1" />
        <div>
          <h2 className="font-semibold text-gray-700 text-lg">
            {t("filters")}
          </h2>
          <p className="text-sm text-gray-500">
            {t("searchForSpecificPurchaseRequestOrCategory")}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
          <Input
            placeholder={`${t("search")} title...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 border-gray-200 focus:border-gray-300 focus:ring-gray-200"
          />
        </div>
        <Select onValueChange={setDepartmentFilter} defaultValue="all">
          <SelectTrigger className="border-gray-200 focus:border-gray-300 focus:ring-gray-200">
            <SelectValue placeholder="Filter by organization" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("allOrganizations")}</SelectItem>
            {Array.from(
              new Set(data?.map((r) => r.buying_department?.name) || [])
            )
              .filter((org) => org && org.trim() !== "")
              .map((org) => (
                <SelectItem key={org} value={org}>
                  {org}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
        <Select onValueChange={setCategoryFilter} defaultValue="all">
          <SelectTrigger className="border-gray-200 focus:border-gray-300 focus:ring-gray-200">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("allCategories")}</SelectItem>
            {Array.from(new Set(data?.map((r) => r.category) || []))
              .filter((cat) => cat && cat.trim() !== "")
              .map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
        <Select onValueChange={setParentCategoryFilter} defaultValue="all">
          <SelectTrigger className="border-gray-200 focus:border-gray-300 focus:ring-gray-200">
            <SelectValue placeholder="Filter by parent category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Parent Categories</SelectItem>
            {Array.from(
              new Set(data?.map((r) => r.buying_department?.name) || [])
            )
              .filter((cat) => cat && cat.trim() !== "")
              .map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>
    </motion.div>
  );
};

// Header Component
const PageHeader = () => {
  const t = useTranslations("purchaseRequests");
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex justify-between items-center"
    >
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t("title")}</h1>
        <p className="text-gray-500">{t("subtitle")}</p>
      </div>
      <Link href="/dashboard/purchase-request/create">
        <Button className="bg-custom-green-500">
          <FileText className="w-4 h-4 mr-2" />
          {t("newRequest")}
        </Button>
      </Link>
    </motion.div>
  );
};

const RequestsTable = ({
  isLoading,
  filteredRequests,
}: {
  isLoading: boolean;
  filteredRequests: PurchaseRequest[];
}) => {
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
  const t = useTranslations("purchaseRequests");

  const toggleRow = (index: string) => {
    setExpandedRows((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  if (isLoading) {
    return <TableSkeleton />;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t("dataTable.reference")}</TableHead>
          <TableHead className="min-w-[250px]">
            {t("dataTable.title")}
          </TableHead>
          <TableHead>{t("dataTable.department")}</TableHead>
          <TableHead>{t("dataTable.category")}</TableHead>
          <TableHead>{t("dataTable.status")}</TableHead>
          <TableHead>{t("dataTable.deadline")}</TableHead>
          <TableHead>{t("dataTable.publishedAt")}</TableHead>
          <TableHead>{t("dataTable.actions")}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredRequests.map((request, index) => (
          <Fragment key={`${request.request_code}-${index}`}>
            <TableRow
              className="cursor-pointer hover:bg-gray-100"
              onClick={() => toggleRow(`${request.title}-${index}`)}
            >
              <TableCell className="font-medium">
                {request.request_code}
              </TableCell>
              <TableCell
                className="max-w-[250px] truncate"
                title={request.title}
              >
                {request.title}
              </TableCell>
              <TableCell>{request.buying_department?.name}</TableCell>
              <TableCell>{request.category}</TableCell>
              <TableCell>
                <Badge
                  variant={request.status === PurchaseRequestStatus.PUBLISHED ? "outline" : "default"}
                >
                  {request.status}
                </Badge>
              </TableCell>
              <TableCell>
                {new Date(request.bidding_deadline).toLocaleDateString()}
              </TableCell>
              <TableCell>
                {request.created_at
                  ? new Date(request.created_at).toLocaleDateString()
                  : "N/A"}
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-2">
                  <Link
                    href={`/dashboard/purchase-request/${request.request_code}`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button variant="ghost" size="sm">
                      <Eye className="w-4 h-4 mr-2" />
                      {t("dataTable.view")}
                    </Button>
                  </Link>
                  {expandedRows[`${request.title}-${index}`] ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </div>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell colSpan={8} className="p-0">
                <AnimatePresence>
                  {expandedRows[`${request.title}-${index}`] && (
                    <ExpandedRow
                      content={{
                        description: request.description,
                        delivery_date: new Date(
                          request.delivery_date
                        ).toISOString(),
                        delivery_address: request.delivery_address,
                        biding_date: new Date(
                          request.biding_date
                        ).toISOString(),
                        biding_address: request.biding_address,
                      }}
                    />
                  )}
                </AnimatePresence>
              </TableCell>
            </TableRow>
          </Fragment>
        ))}
      </TableBody>
    </Table>
  );
};

// Pagination Component
const TablePagination = ({
  currentPage,
  setCurrentPage,
  totalPages,
}: {
  currentPage: number;
  setCurrentPage: (page: number | ((prev: number) => number)) => void;
  totalPages: number;
}) => {
  return (
    <div className="flex items-center justify-between p-4 border-t">
      <div className="flex items-center gap-2">
        <Button
          onClick={() => setCurrentPage(0)}
          disabled={currentPage === 0}
          variant="outline"
          size="sm"
        >
          First
        </Button>
        <Button
          onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
          disabled={currentPage === 0}
          variant="outline"
          size="sm"
        >
          Previous
        </Button>
      </div>

      <span className="text-sm text-muted-foreground">
        Page {currentPage + 1} of {totalPages}
      </span>

      <div className="flex items-center gap-2">
        <Button
          onClick={() => setCurrentPage((prev) => prev + 1)}
          disabled={currentPage >= totalPages - 1}
          variant="outline"
          size="sm"
        >
          Next
        </Button>
        <Button
          onClick={() => setCurrentPage(totalPages - 1)}
          disabled={currentPage >= totalPages - 1}
          variant="outline"
          size="sm"
        >
          Last
        </Button>
      </div>
    </div>
  );
};

export default function OngoingPurchaseRequests() {
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [parentCategoryFilter, setParentCategoryFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(0);

  const { data, isLoading, isError, error } = useGetPurchaseRequests(PurchaseRequestStatus.PUBLISHED);

  const ITEMS_PER_PAGE = data?.length || 10;
  const totalPages = data ? Math.ceil(data.length / ITEMS_PER_PAGE) : 0;

  const filteredRequests =
    data?.filter((request: PurchaseRequest) => {
      const matchesSearch = searchQuery
        ? request.title.toLowerCase().includes(searchQuery.toLowerCase())
        : true;

      const matchesDepartment =
        departmentFilter === "all" ||
        request.buying_department.name === departmentFilter;

      const matchesCategory =
        categoryFilter === "all" || request.category === categoryFilter;

      const matchesParentCategory =
        parentCategoryFilter === "all" ||
        request.buying_department.name === parentCategoryFilter;

      return (
        matchesSearch &&
        matchesDepartment &&
        matchesCategory &&
        matchesParentCategory
      );
    }) ?? [];

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center mb-6">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-[180px] w-full rounded-lg" />
        <div className="rounded-md border">
          <TableSkeleton />
        </div>
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

  return (
    <div className="container mx-auto p-6 space-y-6">
      <PageHeader />

      <SearchFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        setDepartmentFilter={setDepartmentFilter}
        setCategoryFilter={setCategoryFilter}
        setParentCategoryFilter={setParentCategoryFilter}
        data={data}
      />

      <Card>
        <RequestsTable
          isLoading={isLoading}
          filteredRequests={filteredRequests}
        />

        <TablePagination
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          totalPages={totalPages}
        />
      </Card>
    </div>
  );
}
