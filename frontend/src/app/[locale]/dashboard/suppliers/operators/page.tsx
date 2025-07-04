"use client";

import { UnifiedDataTable } from "@/components/ui/ocp/layout/OCPDataTable-new/shared";
import { useTranslations } from "next-intl";
import { getCompanyOperatorsColumns } from "./columns";
import { useGetAllSuppliers } from "@/endpoints/user/get-all-suppliers";
import { User } from "@/types/entities";
import { useState, useCallback } from "react";

export default function SuppliersOperatorsPage() {
  const t = useTranslations("operators");
  const [queryParams, setQueryParams] = useState({
    page: 1,
    limit: 10,
    search: "",
  });

  const suppliersQuery = useGetAllSuppliers(queryParams);
  const columns = getCompanyOperatorsColumns(t as (key: string) => string);

  const handleSearch = useCallback((term: string) => {
    setQueryParams(prev => ({
      ...prev,
      search: term,
      page: 1, // Reset to first page when searching
    }));
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    setQueryParams(prev => ({
      ...prev,
      page: newPage,
    }));
  }, []);

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">{t("description")}</p>
      </div>
      <UnifiedDataTable<User>
        columns={columns}
        queryResult={suppliersQuery}
        searchableFields={["first_name", "last_name", "email"]}
        onSearch={handleSearch}
        page={queryParams.page}
        onPageChange={handlePageChange}
        limit={queryParams.limit}
      />
    </div>
  );
}
