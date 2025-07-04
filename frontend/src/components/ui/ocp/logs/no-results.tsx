import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

export function LogsNoResults() {
  const t = useTranslations("logs");
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration: 0.5,
        ease: [0.4, 0, 0.2, 1],
      }}
      className="flex flex-col items-center justify-center py-8 text-center"
    >
      <AlertCircle className="w-12 h-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-semibold mb-2">No results found</h3>
      <p className="text-muted-foreground max-w-md">
        We couldn&apos;t find any logs matching your search criteria. Try adjusting your filters or search terms.
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
