"use client";
import { Button } from "@/components/ui/button";
import { CustomCard } from "@/components/ui/ocp/custom-card";
import { ViewAttachmentsCard } from "@/components/ui/ocp/purchase-request/view-attachments-card";
import { useAttachments } from "@/endpoints/doc/get-attachements";
import { useGetPurchaseRequestByRef } from "@/endpoints/purchase-requests/purchase-requests";
import { useRouter } from "@/i18n/routing";
import { format } from "date-fns";
import { MoreVertical } from "lucide-react";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";

export default function PurchaseRequestDetailsPage() {
  const router = useRouter();
  const t = useTranslations("PurchaseRequest");
  const { id: purchaseRequestRef } = useParams();
  const { data: purchaseRequest, isLoading } = useGetPurchaseRequestByRef(
    purchaseRequestRef as string
  );

  const { data: attachments = [] } = useAttachments(
    purchaseRequest?.documents?.map((doc) => doc.id) || [],
    true
  );

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "PPP");
    } catch {
      return dateString;
    }
  };

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "PPp");
    } catch {
      return dateString;
    }
  };

  if (isLoading) return <div>Loading...</div>;

  if (!purchaseRequest) return <div>Purchase request not found</div>;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">
            {t("Details.purchaseRequest")} #{purchaseRequest.request_code}
          </h1>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {purchaseRequest.status}
            </span>
            <span>
              {t("Details.due")}: {formatDate(purchaseRequest.delivery_date)} |{" "}
              {t("Details.closing")}:{" "}
              {formatDateTime(purchaseRequest.bidding_deadline)}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="default" className="bg-green-600">
            {t("Details.publish")}
          </Button>
          <Button
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => {
              router.push(
                `/dashboard/purchase-request/${purchaseRequestRef}/bids`
              );
            }}
          >
            {t("Details.viewBids")}
          </Button>
          <Button
            className="bg-gray-500 hover:bg-gray-600"
            onClick={() => {
              router.push(
                `/dashboard/purchase-request/${purchaseRequestRef}/create-bid`
              );
            }}
          >
            {t("Details.submitBid")}
          </Button>
          <Button variant="outline">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
              />
            </svg>
          </Button>
          <Button variant="outline">
            <MoreVertical className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Request Details Card */}
      <CustomCard title={t("Create.cards.requestDetails")}>
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            <div>
              <label className="text-sm text-gray-500">
                {t("Details.title")}
              </label>
              <p className="font-medium">{purchaseRequest.title}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">
                {t("Details.description")}
              </label>
              <p className="font-medium whitespace-pre-wrap">
                {purchaseRequest.description}
              </p>
            </div>
            <div>
              <label className="text-sm text-gray-500">
                {t("Details.department")}
              </label>
              <p className="font-medium">
                {purchaseRequest.buying_department?.name ||
                  t("Details.notSpecified")}
              </p>
            </div>
            <div>
              <label className="text-sm text-gray-500">
                {t("Details.category")}
              </label>
              <p className="font-medium">{purchaseRequest.category}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">
                {t("Details.visibility")}
              </label>
              <p className="font-medium">
                {purchaseRequest.purchase_visibility}
              </p>
            </div>
            <div>
              <label className="text-sm text-gray-500">
                {t("Details.deliveryDate")}
              </label>
              <p className="font-medium">
                {formatDate(purchaseRequest.delivery_date)}
              </p>
            </div>
            <div>
              <label className="text-sm text-gray-500">
                {t("Details.deliveryAddress")}
              </label>
              <p className="font-medium">{purchaseRequest.delivery_address}</p>
            </div>
          </div>
        </div>
      </CustomCard>

      {/* Bidding Details Card */}
      <CustomCard title={t("Create.cards.bidDetailsTitle")}>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          <div>
            <label className="text-sm text-gray-500">
              {t("Details.biddingDate")}
            </label>
            <p className="font-medium">
              {formatDate(purchaseRequest.biding_date)}
            </p>
          </div>
          <div>
            <label className="text-sm text-gray-500">
              {t("Details.biddingAddress")}
            </label>
            <p className="font-medium">{purchaseRequest.biding_address}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">
              {t("Details.biddingDeadline")}
            </label>
            <p className="font-medium">
              {formatDateTime(purchaseRequest.bidding_deadline)}
            </p>
          </div>
        </div>
      </CustomCard>

      {/* Attachments Card */}
      {attachments.length > 0 && (
        <ViewAttachmentsCard
          title={t("Create.cards.attachments")}
          attachments={attachments}
        />
      )}
    </div>
  );
}
