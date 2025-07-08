"use client";

import { LoadingSkeleton } from "@/components/ui/ocp/LoadingSkeleton";
import { useUser } from "@/context/user-context";
import { useDashboard } from "@/context/dashboard-context";
import { EntityTypes } from "@/types/entities/enums/index.enum";
import dynamic from "next/dynamic";
import { useEffect } from "react";
import { setCookie, getCookie } from "cookies-next/client";

const DashboardComponents = {
  [EntityTypes.OCP_AGENT]: dynamic(
    () => import("@/components/ui/ocp/Dashboard").then((mod) => mod.Dashboard)
  ),
  [EntityTypes.SUPPLIER]: dynamic(
    () => import("@/components/ui/ocp/SupplierDashboard").then((mod) => mod.SupplierDashboard)
  ),
};

export default function Dashboard() {
  const { user, isLoading } = useUser();
  const { getDashboardConfig } = useDashboard();

  // Auto-login: Set mock token if not present
  useEffect(() => {
    const token = getCookie("access_token");
    if (!token) {
      console.log("🚀 Auto-setting mock admin token for development");
      setCookie("access_token", "mock-jwt-token-admin-user", { 
        maxAge: 60 * 60 * 24 * 7 // 7 days
      });
    }
  }, []);

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (!user?.entity_type) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            🔧 Mock Authentication Active
          </h2>
          <p className="text-gray-600 mb-4">
            Mock admin user loaded with OCP_AGENT access
          </p>
          <p className="text-sm text-blue-600">
            Ready to explore your anomalies system!
          </p>
        </div>
      </div>
    );
  }

  const DashboardComponent = DashboardComponents[user.entity_type];
  return <DashboardComponent />;
}
