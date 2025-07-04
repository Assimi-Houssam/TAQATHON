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
        <SidebarProvider defaultOpen={false}>
          <NotificationProvider>
            <AppSidebar />
            <main className="w-full bg-white">
              <Navbar />
              <div className="w-full h-full pt-20">
                <main className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-background -z-10" />
                  <div className="relative space-y-8">{children}</div>
                </main>
              </div>
            </main>
          </NotificationProvider>
        </SidebarProvider>
      </UserProvider>
    </Providers>
  );
}
