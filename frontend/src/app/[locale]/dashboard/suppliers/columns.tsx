import { Company } from "@/types/entities";
import { Column } from "@/components/ui/ocp/layout/OCPDataTable-new/shared/BaseDataTable";
import Link from "next/link";
import { CompanyNameCell } from "./components/CompanyNameCell";
import { BusinessScopesCell } from "./components/BusinessScopesCell";
import { CheckCircle2, Clock, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { CompanyApprovalStatus } from "@/types/entities/enums/index.enum";

const CompanyApprovalStatusCell = ({ company }: { company: Company }) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case CompanyApprovalStatus.WAITING_APPROVAL:
        return {
          icon: Clock,
          bgColor: "bg-yellow-50",
          textColor: "text-yellow-700",
          borderColor: "border-yellow-200",
          iconColor: "text-yellow-500",
        };
      case CompanyApprovalStatus.APPROVED:
        return {
          icon: CheckCircle2,
          bgColor: "bg-green-50",
          textColor: "text-green-700",
          borderColor: "border-green-200",
          iconColor: "text-green-500",
        };
      case CompanyApprovalStatus.REJECTED:
        return {
          icon: XCircle,
          bgColor: "bg-red-50",
          textColor: "text-red-700",
          borderColor: "border-red-200",
          iconColor: "text-red-500",
        };
      default:
        return {
          icon: Clock,
          bgColor: "bg-gray-50",
          textColor: "text-gray-700",
          borderColor: "border-gray-200",
          iconColor: "text-gray-500",
        };
    }
  };

  const config = getStatusConfig(company.approval_status);
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium border",
        config.bgColor,
        config.textColor,
        config.borderColor
      )}
    >
      <Icon className={cn("w-3.5 h-3.5", config.iconColor)} />
      <span>{company.approval_status}</span>
    </div>
  );
};

export function getCompanyColumns(
  t: (key: string) => string,
  fields: Array<keyof Company>
): Column<Company>[] {
  const allColumns: Column<Company>[] = [
    {
      header: t("headers.company_name"),
      accessor: "commercial_name" as keyof Company,
      clickable: true,
      render: (_: unknown, company: Company) => <CompanyNameCell company={company} />,
    },
    {
      header: t("headers.approval_status"),
      accessor: "approval_status" as keyof Company,
      clickable: true,
      render: (_: unknown, company: Company) => <CompanyApprovalStatusCell company={company} />,
    },
    {
      header: t("headers.RC"),
      accessor: "RC" as keyof Company,
      clickable: false,
      render: (value: unknown) => (
        <span className="text-sm text-muted-foreground font-medium">
          {String(value || "-")}
        </span>
      ),
    },
    {
      header: t("headers.company_phone"),
      accessor: "company_phone" as keyof Company,
      clickable: false,
      render: (value: unknown) => (
        <span className="text-sm text-muted-foreground">
          {String(value || "-")}
        </span>
      ),
    },
    {
      header: t("headers.business_scopes"),
      accessor: "business_scopes" as keyof Company,
      clickable: false,
      render: (_: unknown, company: Company) => <BusinessScopesCell business_scopes={company.business_scopes || []} />,
    },
    {
      header: t("headers.website"),
      accessor: "website" as keyof Company,
      clickable: false,
      render: (_: unknown, company: Company) => (
        <Link
          className="text-sm text-muted-foreground hover:text-primary hover:underline transition-colors"
          href={company.website || "#"}
          target="_blank"
          rel="noopener noreferrer"
        >
          {company.website || "-"}
        </Link>
      ),
    },
  ];

  return allColumns.filter(column => fields.includes(column.accessor));
}
