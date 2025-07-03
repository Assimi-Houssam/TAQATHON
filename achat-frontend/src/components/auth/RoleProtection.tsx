import { useUser } from "@/context/user-context";
import { ReactNode } from "react";
import LoadingSpinner from "@/components/ui/loading-spinner";

interface RoleProtectionProps {
  children: ReactNode;
  allowedRoles: string[];
  fallback?: ReactNode;
}

export function RoleProtection({
  children,
  allowedRoles,
  fallback,
}: RoleProtectionProps) {
  const { user, isLoading } = useUser();

  if (isLoading) return <LoadingSpinner />;

  const hasRequiredRole = user?.roles?.some((role: string) =>
    allowedRoles.includes(role)
  );

  if (!user || !hasRequiredRole) {
    return fallback || null;
  }

  return <>{children}</>;
}
