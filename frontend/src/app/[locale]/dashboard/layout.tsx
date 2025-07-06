"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { Navbar } from "@/components/ui/ocp/layout/navbar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { UserProvider } from "@/context/user-context";
import Providers from "./providers";
import { NotificationProvider } from "@/context/NotificationContext";
import { ReactNode } from "react";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <Providers>
      <UserProvider>
        <SidebarProvider defaultOpen={true}>
          <NotificationProvider>
            {/* Global Background */}
            <div className="fixed inset-0 bg-gradient-to-br from-slate-50/40 via-white to-blue-50/20 -z-50">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.02)_0%,transparent_50%),radial-gradient(circle_at_80%_80%,rgba(16,185,129,0.02)_0%,transparent_50%)]" />
            </div>
            
            {/* Fixed Navbar */}
            <Navbar />
            
            {/* Main Layout */}
            <div className="flex min-h-[100vh] w-full pt-20">
              {/* Sidebar */}
              <AppSidebar />
              
              {/* Main Content */}
              <main className="flex-1 w-full overflow-x-hidden">
                {children}
              </main>
            </div>
          </NotificationProvider>
        </SidebarProvider>
      </UserProvider>
    </Providers>
  );
}
