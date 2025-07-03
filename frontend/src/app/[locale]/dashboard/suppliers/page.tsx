"use client";

import { UnifiedDataTable } from "@/components/ui/ocp/layout/OCPDataTable-new/shared/UnifiedDataTable";
import { useTranslations } from "next-intl";
import { getCompanyColumns } from "./columns";
import { useGetAllCompanies } from "@/endpoints/company/get-all-companies";
import { Company, BusinessScope } from "@/types/entities";
import { useState, useCallback } from "react";
import { useGetAllBusinessScopes } from "@/endpoints/company/get-all-business-scopes";
import { FilterGroup } from "@/components/ui/ocp/layout/OCPDataTable-new/shared/BaseSearchBar";
import { CompanyApprovalStatus } from "@/types/entities/enums/index.enum";

export default function SuppliersPage() {
  const t = useTranslations("companies");
  const [queryParams, setQueryParams] = useState<{
    page: number;
    limit: number;
    search: string;
    business_scope_ids: number[];
    approval_status: CompanyApprovalStatus[];
  }>({
    page: 1,
    limit: 10,
    search: "",
    approval_status: [CompanyApprovalStatus.APPROVED],
    business_scope_ids: [],
  });

  const companiesQuery = useGetAllCompanies(queryParams);
  const businessScopesQuery = useGetAllBusinessScopes();
  const columns = getCompanyColumns(
    t as (key: string) => string,
    [
      "commercial_name",
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

  const handleBusinessScopesChange = useCallback((value: string | string[]) => {
    const selectedScopes = (Array.isArray(value) ? value : [value]).map(Number);
    setQueryParams((prev) => ({
      ...prev,
      business_scope_ids: selectedScopes,
      page: 1,
    }));
  }, []);

  const filters: FilterGroup[] = [
    {
      label: "Business Scopes",
      options: (businessScopesQuery.data || []).map((scope: BusinessScope) => ({
        label: scope.name,
        value: scope.id.toString(),
      })),
      value: queryParams.business_scope_ids.map(String),
      onChange: handleBusinessScopesChange,
      isMulti: true,
    },
  ];

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">{t("description")}</p>
      </div>
      <UnifiedDataTable<Company>
        columns={columns}
        queryResult={companiesQuery}
        searchableFields={["commercial_name", "business_scopes", "RC"]}
        onSearch={handleSearch}
        page={queryParams.page}
        onPageChange={handlePageChange}
        limit={queryParams.limit}
        filters={filters}
      />
    </div>
  );
}
