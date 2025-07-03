'use client';

import { TimeFrameProvider } from "@/context/TimeFrameContext";
import { DashboardProvider } from "@/context/dashboard-context";
import { ReactNode } from "react";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <TimeFrameProvider>
      <DashboardProvider>
        {children}
      </DashboardProvider>
    </TimeFrameProvider>
  );
} 