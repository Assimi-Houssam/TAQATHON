"use client";

import { UnifiedDataTable } from "@/components/ui/ocp/layout/OCPDataTable-new/shared/UnifiedDataTable";
import { useGetOcpAgents } from "@/endpoints/user/get-ocp-agents";
import { Departement, User } from "@/types/entities";
import { useTranslations } from "next-intl";
import { useCallback, useState } from "react";
import { getAgentColumns } from "./columns";
import { FilterGroup } from "@/components/ui/ocp/layout/OCPDataTable-new/shared/BaseSearchBar";
import { useDepartments } from "@/endpoints/departments/get-departements";

export default function AgentsPage() {
  const t = useTranslations("agents");
  const [queryParams, setQueryParams] = useState<{
    page: number;
    limit: number;
    search: string;
    departements: number[];
  }>({
    page: 1,
    limit: 10,
    search: "",
    departements: [],
  });

  const columns = getAgentColumns(t as (key: string) => string);
  const agentsQuery = useGetOcpAgents(queryParams);
  const departmentsQury = useDepartments();

  const handleSearch = useCallback((term: string) => {
    setQueryParams((prev) => ({
      ...prev,
      search: term,
      page: 1, // Reset to first page when searching
    }));
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    setQueryParams((prev) => ({
      ...prev,
      page: newPage,
    }));
  }, []);

  const handleDepartmentsChange = useCallback((value: string | string[]) => {
    const selectedDepartments = (Array.isArray(value) ? value : [value]).map(Number);
    setQueryParams((prev) => ({
      ...prev,
      departements: selectedDepartments,
      page: 1, // Reset to first page when filter changes
    }));
  }, []);

  const filters: FilterGroup[] = [
    {
      label: "Departements",
      options: (departmentsQury.data || []).map((departement: Departement) => ({
        label: departement.name,
        value: departement.id.toString(),
      })),
      value: queryParams.departements.map(String),
      onChange: handleDepartmentsChange,
      isMulti: true,
    },
  ];

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">{t("description")}</p>
      </div>
      <UnifiedDataTable<User>
        columns={columns}
        queryResult={agentsQuery}
        searchableFields={["first_name", "last_name", "email", "title"]}
        onSearch={handleSearch}
        page={queryParams.page}
        onPageChange={handlePageChange}
        limit={queryParams.limit}
        filters={filters}
      />
    </div>
  );
}