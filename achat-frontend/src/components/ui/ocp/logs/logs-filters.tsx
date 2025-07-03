"use client";

import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import DatePickerInput from "@/components/ui/date-picker";
import { useCallback } from "react";

export function LogsFilters() {
  const t = useTranslations("logs");
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateQuery = useCallback(
    (params: Record<string, string | undefined>) => {
      const query = new URLSearchParams(searchParams);
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          query.set(key, value);
        } else {
          query.delete(key);
        }
      });
      router.push(`?${query.toString()}`);
    },
    [searchParams, router]
  );

  return (
    <motion.div
      className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
    >
      <DatePickerInput
        defaultValue={
          searchParams.get("startDate")
            ? new Date(searchParams.get("startDate") as string)
            : undefined
        }
        onChange={(date) =>
          updateQuery({ startDate: date?.toISOString(), page: "1" })
        }
        placeholder={t("filters.start_date")}
      />

      <DatePickerInput
        defaultValue={
          searchParams.get("endDate")
            ? new Date(searchParams.get("endDate") as string)
            : undefined
        }
        onChange={(date) =>
          updateQuery({ endDate: date?.toISOString(), page: "1" })
        }
        placeholder={t("filters.end_date")}
      />

      <Input
        defaultValue={searchParams.get("search") || ""}
        onChange={(e) => updateQuery({ search: e.target.value, page: "1" })}
        placeholder={t("filters.search")}
      />
    </motion.div>
  );
}
