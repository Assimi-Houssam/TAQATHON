"use client";

import { EntityTypes } from "@/types/entities/enums/index.enum";
import { createContext, useContext, ReactNode } from "react";

interface DashboardConfig {
  component: () => Promise<{ Dashboard?: React.ComponentType; SupplierDashboard?: React.ComponentType }>;
  metrics: string[];
  features: string[];
}

interface DashboardContextType {
  getDashboardConfig: (entityType: EntityTypes) => DashboardConfig;
}

const dashboardConfigs: Record<EntityTypes, DashboardConfig> = {
  [EntityTypes.OCP_AGENT]: {
    component: () => import("@/components/ui/ocp/Dashboard"),
    metrics: ["companies", "suppliers", "bids", "agents", "purchaseRequests"],
    features: ["departments", "ongoingPurchases", "topCompanies", "tasks"],
  },
  [EntityTypes.SUPPLIER]: {
    component: () => import("@/components/ui/ocp/SupplierDashboard"),
    metrics: ["activeBids", "wonContracts", "ongoingDeliveries", "successRate"],
    features: ["recentBids", "recentActivities", "companyOverview", "tasks"],
  },
};

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const getDashboardConfig = (entityType: EntityTypes): DashboardConfig => {
    return dashboardConfigs[entityType];
  };

  return (
    <DashboardContext.Provider value={{ getDashboardConfig }}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }
  return context;
} 