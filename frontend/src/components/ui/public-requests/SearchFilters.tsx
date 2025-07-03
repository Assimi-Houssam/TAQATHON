import { PurchaseRequest } from "@/types/entities";
import { useTranslations } from "next-intl";

interface SearchFiltersProps {
  requests: PurchaseRequest[];
}

export function SearchFilters({ requests }: SearchFiltersProps) {
  const t = useTranslations("publicRequests");
  return (
    <div className="mb-6 space-y-4">
      <div className="flex gap-4 flex-wrap">
        <input
          type="text"
          placeholder="Search requests..."
          className="px-4 py-2 border rounded-lg flex-1"
        />
        <select className="px-4 py-2 border rounded-lg">
          <option value="">All Organizations</option>
          {Array.from(new Set(requests.map((r) => r.buying_department.name)))
            .filter((org) => org && org.trim() !== "")
            .map((org) => (
              <option key={org} value={org}>
                {org}
              </option>
            ))}
        </select>
        <select className="px-4 py-2 border rounded-lg">
          <option value="">{t("allCategories")}</option>
          {Array.from(new Set(requests.map((r) => r.category)))
            .filter((cat) => cat && cat.trim() !== "")
            .map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
        </select>
      </div>
    </div>
  );
}
