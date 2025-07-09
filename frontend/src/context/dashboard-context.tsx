"use client";

import { EntityTypes } from "@/types/entities/enums/index.enum";
import { createContext, useContext, ReactNode } from "react";

interface DashboardConfig {
  component: () => Promise<{ Dashboard?: React.ComponentType }>;
  metrics: string[];
  features: string[];
}

interface DashboardContextType {
  getDashboardConfig: (entityType: EntityTypes) => DashboardConfig;
}

const dashboardConfigs: Record<EntityTypes, DashboardConfig> = {
  [EntityTypes.OCP_AGENT]: {
    component: () => import("@/components/ui/taqa_x/Dashboard"),
    metrics: ["anomalies", "maintenance", "critical", "resolved"],
    features: ["anomalyTracking", "maintenanceWindows", "dashboard"],
  },
  [EntityTypes.SUPPLIER]: {
    component: () => import("@/components/ui/taqa_x/Dashboard"), // Use same dashboard for now
    metrics: ["anomalies", "maintenance", "critical", "resolved"],
    features: ["anomalyTracking", "maintenanceWindows", "dashboard"],
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