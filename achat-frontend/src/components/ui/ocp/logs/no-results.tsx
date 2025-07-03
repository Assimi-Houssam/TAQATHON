import { SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

export function NoResults() {
  const t = useTranslations("logs");
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration: 0.5,
        ease: [0.4, 0, 0.2, 1],
      }}
      className="flex flex-col items-center justify-center py-16 text-center"
    >
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-custom-green-100 rounded-full blur-xl opacity-50 animate-pulse" />
        <div className="relative bg-custom-green-50 rounded-full p-4">
          <SearchX className="w-8 h-8 text-custom-green-600" />
        </div>
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-3">
        {t("no_results.title")}
      </h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-6">
        {t("no_results.description")}
      </p>
      <Button
        variant="outline"
        onClick={() => {
          const url = new URL(window.location.href);
          url.searchParams.delete("search");
          url.searchParams.delete("startDate");
          url.searchParams.delete("endDate");
          window.history.pushState({}, "", url);
        }}
        className="group"
      >
        <span className="inline-block transition-transform group-hover:-translate-x-1">
          ←
        </span>{" "}
        {t("filters.all")}
      </Button>
    </motion.div>
  );
}
