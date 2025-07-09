"use client";

import { UnifiedDataTable } from "@/components/ui/taqa/layout/OCPDataTable-new/shared";
import { useTranslations } from "next-intl";
import { getCompanyColumns } from "../columns";
import { useGetAllCompanies } from "@/endpoints/company/get-all-companies";
import { useGetBusinessScopes } from "@/endpoints/company/get-business-scopes";
import { Company } from "@/types/entities";
import { useState, useCallback } from "react";
import { CompanyApprovalStatus } from "@/types/entities/enums/index.enum";
import { FilterGroup } from "@/components/ui/taqa/layout/OCPDataTable-new/shared";

export default function PendingVerificationPage() {
  const t = useTranslations("companies");
  const [queryParams, setQueryParams] = useState({
    page: 1,
    limit: 10,
    search: "",
    business_scope_ids: [] as number[],
    approval_status: [
      CompanyApprovalStatus.WAITING_APPROVAL,
      CompanyApprovalStatus.REJECTED,
      CompanyApprovalStatus.FILLED_INFO,
      CompanyApprovalStatus.CREATED,
    ],
  });

  const companiesQuery = useGetAllCompanies(queryParams);
  const businessScopesQuery = useGetBusinessScopes();
  const columns = getCompanyColumns(
    t as (key: string) => string,
    [
      "commercial_name",
      "approval_status",
      "RC",
      "company_phone",
      "business_scopes",
      "website",
    ] as Array<keyof Company>
  );

  const handleSearch = useCallback((term: string) => {
    setQueryParams((prev) => ({
      ...prev,
      search: term,
      page: 1,
    }));
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    setQueryParams((prev) => ({
      ...prev,
      page: newPage,
    }));
  }, []);

  const filters: FilterGroup[] = [
    {
      label: "Approval Status",
      options: [
        {
          label: CompanyApprovalStatus.WAITING_APPROVAL,
          value: CompanyApprovalStatus.WAITING_APPROVAL,
        },
        {
          label: CompanyApprovalStatus.REJECTED,
          value: CompanyApprovalStatus.REJECTED,
        },
        {
          label: CompanyApprovalStatus.CREATED,
          value: CompanyApprovalStatus.CREATED,
        },
        {
          label: CompanyApprovalStatus.FILLED_INFO,
          value: CompanyApprovalStatus.FILLED_INFO,
        },
      ],
      value: queryParams.approval_status,
      isMulti: true,
      onChange: (value) => {
        if (Array.isArray(value)) {
          setQueryParams((prev) => ({
            ...prev,
            approval_status: value as CompanyApprovalStatus[],
            page: 1,
          }));
        }
      },
    },
    {
      label: "Business Scopes",
      options:
        businessScopesQuery.data?.map((scope) => ({
          label: scope.name,
          value: String(scope.id),
        })) || [],
      value: queryParams.business_scope_ids.map(String),
      isMulti: true,
      onChange: (value) => {
        if (Array.isArray(value)) {
          setQueryParams((prev) => ({
            ...prev,
            business_scope_ids: value.map(Number),
            page: 1,
          }));
        }
      },
    },
  ];

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {t("pending_verification_title")}
        </h1>
        <p className="text-muted-foreground">
          {t("pending_verification_description")}
        </p>
      </div>
      <UnifiedDataTable<Company>
        columns={columns}
        queryResult={companiesQuery}
        searchableFields={["commercial_name", "business_scopes", "RC"]}
        filters={filters}
        onSearch={handleSearch}
        page={queryParams.page}
        onPageChange={handlePageChange}
        limit={queryParams.limit}
      />
    </div>
  );
}
