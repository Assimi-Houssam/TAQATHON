"use client";

import { LoadingSkeleton } from "@/components/ui/ocp/LoadingSkeleton";
import { useUser } from "@/context/user-context";
import { useDashboard } from "@/context/dashboard-context";
import { EntityTypes } from "@/types/entities/enums/index.enum";
import dynamic from "next/dynamic";

const DashboardComponents = {
  [EntityTypes.OCP_AGENT]: dynamic(
    () => import("@/components/ui/ocp/OCPDashboard").then((mod) => mod.OCPDashboard)
  ),
  [EntityTypes.SUPPLIER]: dynamic(
    () => import("@/components/ui/ocp/SupplierDashboard").then((mod) => mod.SupplierDashboard)
  ),
};

export default function Dashboard() {
  const { user, isLoading } = useUser();
  const { getDashboardConfig } = useDashboard();

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (!user?.entity_type) {
    return <div>No entity type specified</div>;
  }

  const DashboardComponent = DashboardComponents[user.entity_type];
  return <DashboardComponent />;
}
