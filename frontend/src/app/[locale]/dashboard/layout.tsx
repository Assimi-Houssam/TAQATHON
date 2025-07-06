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
            <Navbar />
            <div className="flex min-h-[100vh] w-full pt-20">
              <AppSidebar />
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
