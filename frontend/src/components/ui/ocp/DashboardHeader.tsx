import { ReactNode } from "react";

interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export const DashboardHeader = ({
  title,
  subtitle,
  action,
}: DashboardHeaderProps) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm text-muted-foreground">
            {subtitle}
          </p>
        )}
      </div>
      {action && (
        <div className="flex items-center gap-2">
          {action}
        </div>
      )}
    </div>
  );
};
