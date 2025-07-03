import { Badge } from "@/components/ui/badge";
import { SCOPE_COLORS } from "../constants";
import { cn } from "@/lib/utils";
import { BusinessScope } from "@/types/entities";

export function BusinessScopesCell({
  business_scopes,
}: {
  business_scopes: BusinessScope[];
}) {
  if (!business_scopes?.length) {
    return (
      <Badge
        variant="outline"
        className="text-xs font-normal text-muted-foreground"
      >
        No Business Scope
      </Badge>
    );
  }
  return (
    <div className="flex flex-wrap gap-1.5">
      {business_scopes.slice(0, 3).map((scope) => {
        const colors = SCOPE_COLORS[scope.name] || SCOPE_COLORS.default;
        return (
          <Badge
            key={scope.id}
            variant="secondary"
            className={cn(
              "text-xs font-medium transition-colors",
              colors.bg,
              colors.text
            )}
          >
            {scope.name}
          </Badge>
        );
      })}
    </div>
  );
}
