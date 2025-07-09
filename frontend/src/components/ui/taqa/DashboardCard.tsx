import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface DashboardCardProps {
  title: string;
  icon?: LucideIcon | ReactNode; // Accepts both component types and JSX elements
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  isLoading?: boolean;
  action?: ReactNode;
}

export const DashboardCard = ({
  title,
  icon: Icon,
  children,
  className,
  contentClassName,
  isLoading = false,
  action,
}: DashboardCardProps) => {
  if (isLoading) {
    return (
      <Card className={cn("overflow-hidden", className)}>
        <div className="p-6 space-y-6">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5" />
            <Skeleton className="h-6 w-32" />
          </div>
          <div className="space-y-3">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className={cn("overflow-hidden border-zinc-100", className)}>
      <div className="p-6 max-h-full">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            {/* Handle both function components and JSX elements */}
            {Icon && typeof Icon === "function" ? (
              <Icon className="h-5 w-5 text-muted-foreground" />
            ) : (
              Icon
            )}
            <h2 className="font-semibold text-lg">{title}</h2>
          </div>
          {action}
        </div>
        {children}
      </div>
    </Card>
  );
};
