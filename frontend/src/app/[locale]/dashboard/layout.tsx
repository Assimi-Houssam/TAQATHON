"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { Navbar } from "@/components/ui/taqa/layout/navbar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
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
            <div className="min-h-screen w-full">
              <Navbar />
              <div className="flex pt-20">
                <AppSidebar />
                <SidebarInset className="flex-1 w-full bg-gray-50 min-w-0 overflow-hidden">
                  <div className="p-6 max-w-full min-w-0 overflow-hidden">
                    {children}
                  </div>
                </SidebarInset>
              </div>
            </div>
          </NotificationProvider>
        </SidebarProvider>
      </UserProvider>
    </Providers>
  );
}
