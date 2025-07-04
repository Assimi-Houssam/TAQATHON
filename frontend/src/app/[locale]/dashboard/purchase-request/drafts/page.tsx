"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BaseTableRow } from "@/components/ui/purchase-requests/base-table-row";
import { ExpandedRow } from "@/components/ui/purchase-requests/expanded-row";
import { PageHeader } from "@/components/ui/purchase-requests/page-header";
import { TableSkeleton } from "@/components/ui/purchase-requests/skeletons";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BuyingEntityType,
  MockAttachment,
  PRVisibilityType,
  PurchaseRequest,
  useDeletePurchaseRequest,
  useDraftPurchaseRequests,
  usePublishPurchaseRequest,
} from "@/endpoints/purchase-requests/usePurchaseRequests";
import { formatDate } from "date-fns";
import {
  FileIcon,
  FileText,
  FileTextIcon,
  ImageIcon,
  Send,
  Trash2
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

function formatVisibilityType(type: PRVisibilityType): {
  label: string;
  variant: "default" | "secondary" | "outline";
} {
  const config = {
    [PRVisibilityType.INVITE_ONLY]: {
      label: "Invite Only",
      variant: "secondary" as const,
    },
    [PRVisibilityType.PUBLIC]: {
      label: "Public",
      variant: "default" as const,
    },
    [PRVisibilityType.HIDDEN]: {
      label: "Hidden",
      variant: "outline" as const,
    },
  };
  return config[type];
}

function formatBuyingEntity(entity: BuyingEntityType): {
  label: string;
  color: string;
} {
  const config = {
    [BuyingEntityType.OCP_GROUP]: {
      label: "OCP Group",
      color: "text-blue-600",
    },
    [BuyingEntityType.OCP_AFRIQUE]: {
      label: "OCP Afrique",
      color: "text-blue-600",
    },
    [BuyingEntityType.OCP_FOUNDATION]: {
      label: "OCP Foundation",
      color: "text-blue-600",
    },
    [BuyingEntityType.OCP_SA]: {
      label: "OCP SA",
      color: "text-blue-600",
    },
    [BuyingEntityType.OCP_INT]: {
      label: "OCP International",
      color: "text-blue-600",
    },
    [BuyingEntityType.UM6P]: {
      label: "UM6P",
      color: "text-blue-600",
    },
  };
  return config[entity];
}

function DetailSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border">
      <h3 className="text-base font-semibold text-gray-900 mb-4">{title}</h3>
      {children}
    </div>
  );
}

type InfoRowValue =
  | string
  | { label: string; variant: string }
  | { label: string; color: string };

function InfoRow({
  label,
  value,
  type = "text",
}: {
  label: string;
  value: InfoRowValue;
  type?: "text" | "visibility" | "entity";
}) {
  return (
    <div className="flex items-center">
      <span className="text-gray-500 w-24">{label}:</span>
      {type === "visibility" &&
        typeof value === "object" &&
        "variant" in value ? (
        <Badge variant={value.variant as "default" | "secondary" | "outline"}>
          {value.label}
        </Badge>
      ) : type === "entity" && typeof value === "object" && "color" in value ? (
        <span className={`font-medium ${value.color}`}>{value.label}</span>
      ) : (
        <span className="text-gray-700">{String(value)}</span>
      )}
    </div>
  );
}

function AttachmentsList({ attachments }: { attachments: MockAttachment[] }) {
  const getFileIcon = (type: string) => {
    switch (type) {
      case "pdf":
        return <FileTextIcon className="h-4 w-4 text-red-500" />;
      case "image":
        return <ImageIcon className="h-4 w-4 text-blue-500" />;
      default:
        return <FileIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-2">
      {attachments.map((file) => (
        <Button
          key={file.id}
          variant="ghost"
          className="w-full justify-between h-auto p-2 font-normal"
          onClick={() => {
            toast.info(`Downloading ${file.name}...`);
          }}
        >
          <div className="flex items-center gap-2">
            {getFileIcon(file.type)}
            <span className="text-sm">{file.name}</span>
          </div>
          <span className="text-xs text-gray-500">{file.size}</span>
        </Button>
      ))}
    </div>
  );
}

function DraftTableRow({
  draft,
  isExpanded,
  onToggle,
  onPublish,
  onDelete,
  isPublishing,
  isDeleting,
}: {
  draft: PurchaseRequest;
  isExpanded: boolean;
  onToggle: () => void;
  onPublish: () => void;
  onDelete: () => void;
  isPublishing: boolean;
  isDeleting: boolean;
}) {
  return (
    <>
      <BaseTableRow isExpanded={isExpanded} onToggle={onToggle}>
        <TableCell className="font-medium">{draft.request_code}</TableCell>
        <TableCell>{draft.title}</TableCell>
        <TableCell>{draft.department}</TableCell>
        <TableCell>{formatDate(draft.created_at, "dd/MM/yyyy")}</TableCell>
        <TableCell>{formatDate(draft.delivery_date, "dd/MM/yyyy")}</TableCell>
        <TableCell>
          <Badge variant="outline">Draft</Badge>
        </TableCell>
        <TableCell>
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onPublish();
              }}
              disabled={isPublishing}
            >
              <Send className="h-4 w-4 mr-2" />
              Publish
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              disabled={isDeleting}
              className="text-red-500 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </TableCell>
      </BaseTableRow>
      {isExpanded && (
        <TableRow>
          <TableCell colSpan={8} className="p-0">
            <ExpandedRow
              content={{
                description: draft.description,
                delivery_date: draft.delivery_date,
                delivery_address: draft.delivery_address,
                biding_date: draft.biding_date,
                biding_address: draft.biding_address,
              }}
            />
          </TableCell>
        </TableRow>
      )}
    </>
  );
}

export default function DraftsPage() {
  const { data: drafts = [], isLoading } = useDraftPurchaseRequests();
  const publishMutation = usePublishPurchaseRequest();
  const deleteMutation = useDeletePurchaseRequest();

  // Add state to track expanded rows
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  // Add toggle function
  const toggleRow = (id: number) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>

        <div className="rounded-md border">
          <TableSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <PageHeader
          title="Draft Purchase Requests"
          description="Manage and publish your draft purchase requests"
        />
        <Link href="/dashboard/purchase-request/create">
          <Button className="bg-custom-green-500">
            <FileText className="w-4 h-4 mr-2" />
            New Request
          </Button>
        </Link>
      </div>

      {drafts.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-500">No draft purchase requests found</p>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Request Code</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead>Delivery Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {drafts.map((draft: PurchaseRequest) => (
                <DraftTableRow
                  key={draft.id}
                  draft={draft}
                  isExpanded={expandedRows.has(draft.id)}
                  onToggle={() => toggleRow(draft.id)}
                  onPublish={() => publishMutation.mutate(draft.id)}
                  onDelete={() => deleteMutation.mutate(draft.id)}
                  isPublishing={publishMutation.isPending}
                  isDeleting={deleteMutation.isPending}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
