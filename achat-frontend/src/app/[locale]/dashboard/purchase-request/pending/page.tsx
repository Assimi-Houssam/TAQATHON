"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SearchFilters } from "@/components/ui/public-requests/SearchFilters";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useGetPurchaseRequests } from "@/endpoints/purchase-requests/purchase-requests";
import { PurchaseRequest } from "@/types/entities";
import { PurchaseRequestStatus } from "@/types/entities/enums/index.enum";
import { motion } from "framer-motion";
import { CheckCircle2, Eye, XCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { Fragment, useState } from "react";
import { toast } from "sonner";

// Add ApprovalDialog component
const ApprovalDialog = ({
  isOpen,
  onClose,
  onConfirm,
  type,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (comment: string) => void;
  type: "approve" | "deny";
}) => {
  const [comment, setComment] = useState("");
  const t = useTranslations("dataTable");

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {type === "approve" ? t("approveRequest") : t("denyRequest")}
          </DialogTitle>
          <DialogDescription>
            {type === "approve"
              ? t("approveRequestDescription")
              : t("denyRequestDescription")}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Textarea
            placeholder={t("commentPlaceholder")}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="min-h-[100px]"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t("cancel")}
          </Button>
          <Button
            variant={type === "approve" ? "default" : "destructive"}
            onClick={() => onConfirm(comment)}
          >
            {type === "approve" ? t("approve") : t("deny")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Modified RequestsTable component for pending requests
const RequestsTable = ({
  isLoading,
  filteredRequests,
}: {
  isLoading: boolean;
  filteredRequests: PurchaseRequest[];
}) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
  const [approvalDialog, setApprovalDialog] = useState<{
    isOpen: boolean;
    type: "approve" | "deny";
    requestId: string | null;
  }>({ isOpen: false, type: "approve", requestId: null });

  const t = useTranslations("dataTable");

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const toggleRow = (index: string) => {
    setExpandedRows((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleApproval = async (comment: string) => {
    try {
      // TODO: Implement API call to approve/deny request
      // const response = await approvePurchaseRequest(approvalDialog.requestId, comment);
      toast.success(
        approvalDialog.type === "approve"
          ? "Request approved successfully"
          : "Request denied successfully"
      );
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error("Failed to process request");
    } finally {
      setApprovalDialog({ isOpen: false, type: "approve", requestId: null });
    }
  };
  if (isLoading) {
    return <Skeleton className="w-full h-96" />;
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("pendingRequests.reference")}</TableHead>
            <TableHead className="min-w-[250px]">
              {t("pendingRequests.title")}
            </TableHead>
            <TableHead>{t("pendingRequests.department")}</TableHead>
            <TableHead>{t("pendingRequests.category")}</TableHead>
            <TableHead>{t("pendingRequests.status")}</TableHead>
            <TableHead>{t("pendingRequests.submittedAt")}</TableHead>
            <TableHead>{t("pendingRequests.actions")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredRequests.map((request, index) => (
            <Fragment key={`${request.request_code}-${index}`}>
              <TableRow>
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
                  <Badge variant="secondary">Pending</Badge>
                </TableCell>
                <TableCell>
                  {request.created_at
                    ? new Date(request.created_at).toLocaleDateString()
                    : "N/A"}
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-green-600 hover:text-green-700"
                      onClick={() =>
                        setApprovalDialog({
                          isOpen: true,
                          type: "approve",
                          requestId: request.id.toString(),
                        })
                      }
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      {t("approve")}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                      onClick={() =>
                        setApprovalDialog({
                          isOpen: true,
                          type: "deny",
                          requestId: request.id.toString(),
                        })
                      }
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      {t("deny")}
                    </Button>
                    <Link href={`/dashboard/purchase-request/${request.id}`}>
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4 mr-2" />
                        {t("view")}
                      </Button>
                    </Link>
                  </div>
                </TableCell>
              </TableRow>
            </Fragment>
          ))}
        </TableBody>
      </Table>

      <ApprovalDialog
        isOpen={approvalDialog.isOpen}
        onClose={() =>
          setApprovalDialog({ isOpen: false, type: "approve", requestId: null })
        }
        onConfirm={handleApproval}
        type={approvalDialog.type}
      />
    </>
  );
};

export default function PendingPurchaseRequests() {
  /* eslint-disable @typescript-eslint/no-unused-vars */
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [parentCategoryFilter, setParentCategoryFilter] = useState("all");
  /* eslint-enable @typescript-eslint/no-unused-vars */

  // Modify this to get only pending requests
  const { data, isLoading, isError, error } = useGetPurchaseRequests(PurchaseRequestStatus.WAITING_FOR_SELECTION);

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

  const t = useTranslations("dataTable");

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
          <Skeleton className="h-[400px] w-full" />
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
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center"
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t("pendingRequests.title")}
          </h1>
          <p className="text-gray-500">{t("pendingRequests.description")}</p>
        </div>
      </motion.div>
      <SearchFilters requests={filteredRequests} />
      <Card>
        <RequestsTable
          isLoading={isLoading}
          filteredRequests={filteredRequests}
        />
      </Card>
    </div>
  );
}
