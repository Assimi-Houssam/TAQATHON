"use client";

import { DashboardHeader } from "@/components/ui/ocp/DashboardHeader";
import { ExportMenu } from "@/components/ui/ocp/ExportMenu";
import { TimeframeSelect } from "@/components/ui/ocp/TimeframeSelect";
import {
  TrendingUp,
  AlertTriangle,
  BarChart3,
  Settings,
  Plus,
  Users,
  Activity,
  Clock,
  CheckCircle,
  AlertOctagon,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const Dashboard = () => {
  const t = useTranslations("dashboard");

  // Mock export handlers for demo purposes
  const handleExportXLSX = () => {
    console.log("Export XLSX - Feature coming soon");
  };

  const handleExportJSON = () => {
    console.log("Export JSON - Feature coming soon");
  };

  const handleExportCSV = () => {
    console.log("Export CSV - Feature coming soon");
  };

  const handlePrint = () => {
    console.log("Print - Feature coming soon");
  };

  return (
    <div className="w-full p-4 md:p-6 lg:p-8 space-y-6 md:space-y-8">
      {/* Header Section */}
      <Card className="p-4 md:p-6">
        <DashboardHeader
          title={t("title")}
          subtitle={t("subtitle")}
          action={
            <div className="flex items-center gap-3">
              <TimeframeSelect
                fromYear={new Date().getFullYear() - 5}
                toYear={new Date().getFullYear()}
              />
              <ExportMenu
                onExportXLSX={handleExportXLSX}
                onExportJSON={handleExportJSON}
                onExportCSV={handleExportCSV}
                onPrint={handlePrint}
              />
            </div>
          }
        />
      </Card>

      {/* Quick Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {[
          {
            title: "Total Anomalies",
            value: "—",
            subtitle: "Ready for integration",
            icon: <AlertTriangle className="h-5 w-5 text-blue-600" />,
          },
          {
            title: "System Status",
            value: "—",
            subtitle: "Monitoring ready",
            icon: <Activity className="h-5 w-5 text-green-600" />,
          },
          {
            title: "Response Time",
            value: "—",
            subtitle: "Analytics pending",
            icon: <Clock className="h-5 w-5 text-amber-600" />,
          },
          {
            title: "Resolved",
            value: "—",
            subtitle: "Tracking enabled",
            icon: <CheckCircle className="h-5 w-5 text-emerald-600" />,
          },
        ].map((metric, index) => (
          <Card key={index} className="p-4 md:p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-blue-50 rounded-lg">
                {metric.icon}
              </div>
              <div className="text-right">
                <div className="text-xl md:text-2xl font-bold text-slate-900 mb-1">
                  {metric.value}
                </div>
                <div className="text-xs md:text-sm text-slate-500">
                  {metric.subtitle}
                </div>
              </div>
            </div>
            <h3 className="text-sm font-medium text-slate-700">
              {metric.title}
            </h3>
          </Card>
        ))}
      </div>

      {/* Main Content Grid - Placeholder Sections */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 md:gap-8">
        {/* Anomaly Analytics Placeholder */}
        <Card className="p-6 md:p-8 text-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <BarChart3 className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Anomaly Analytics
              </h3>
              <p className="text-slate-600 text-sm max-w-md">
                Chart components will be integrated here to visualize anomaly patterns, 
                trends, and distribution across different systems.
              </p>
            </div>
          </div>
        </Card>

        {/* System Overview Placeholder */}
        <Card className="p-6 md:p-8 text-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                System Overview
              </h3>
              <p className="text-slate-600 text-sm max-w-md">
                Real-time monitoring dashboard showing system health, 
                performance metrics, and operational status.
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Action Items Section */}
      <Card className="p-4 md:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Quick Actions</h2>
            <p className="text-slate-600 text-sm mt-1">
              Common tasks and shortcuts for anomaly management
            </p>
          </div>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Configure
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              title: "Report Anomaly",
              description: "Submit a new anomaly detection report",
              icon: <Plus className="h-5 w-5" />,
              action: "Create Report",
            },
            {
              title: "Review Alerts",
              description: "Check pending alerts and notifications",
              icon: <AlertOctagon className="h-5 w-5" />,
              action: "View Alerts",
            },
            {
              title: "Team Dashboard",
              description: "Access team performance metrics",
              icon: <Users className="h-5 w-5" />,
              action: "View Team",
            },
          ].map((item, index) => (
            <Card key={index} className="border-slate-200">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-blue-50 rounded-lg mt-1">
                    {item.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-slate-900 mb-1">
                      {item.title}
                    </h4>
                    <p className="text-sm text-slate-600 mb-3">
                      {item.description}
                    </p>
                    <Button variant="outline" size="sm" className="w-full">
                      {item.action}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </Card>

      {/* Footer Info */}
      <div className="text-center py-4 text-xs text-slate-500">
        <p>© 2024 TAQATHON Anomaly Management Platform • Ready for Production</p>
      </div>
    </div>
  );
};
