"use client";

import { DashboardHeader } from "@/components/ui/taqa_x/DashboardHeader";
import { ExportMenu } from "@/components/ui/taqa_x/ExportMenu";
import { TimeframeSelect } from "@/components/ui/taqa_x/TimeframeSelect";
import { KPICard, PercentageKPICard, TimeKPICard } from "@/components/ui/taqa_x/KPICard";
import { useAllKPIs } from "@/hooks/useKPIs";
import { useAnomalies } from "@/hooks/useAnomalies";
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
  Target,
  Timer,
  Zap,
  PlayCircle,
  CheckCircle2,
  ArrowRight,
  Monitor,
  Shield,
  AlertCircle,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import { useState, useEffect } from "react";

export const Dashboard = () => {
  const t = useTranslations("dashboard");
  const kpis = useAllKPIs();
  const { data: anomaliesData, isLoading: anomaliesLoading } = useAnomalies({
    page: 1,
    limit: 5,
  });
  
  // Fix hydration mismatch by making timestamp client-side only
  const [currentTime, setCurrentTime] = useState<string>("");
  
  useEffect(() => {
    setCurrentTime(new Date().toLocaleTimeString());
  }, []);

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

  // Calculate completion rate for action plans
  const actionPlanCompletionRate = kpis.actionPlan.data?.action
    ? (kpis.actionPlan.data.action.completed / kpis.actionPlan.data.action.total) * 100
    : 0;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="w-full max-w-none p-6 space-y-6">
        {/* Header Section */}
        <Card className="p-6 border border-slate-200 bg-white">
          <DashboardHeader
            title={t("title")}
            subtitle="Monitor anomalies, track KPIs, and manage system performance"
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

        {/* Primary KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Closing Rate */}
          <Card className="p-6 border border-slate-200 bg-white hover:border-slate-300 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-blue-50 rounded-lg border border-blue-100">
                <CheckCircle2 className="h-5 w-5 text-blue-600" />
              </div>
              <div className="text-right">
                <p className="text-xl font-semibold text-slate-900">
                  {kpis.isLoading ? "..." : `${Math.round(kpis.closed.data?.percentageWithDates || 0)}%`}
                </p>
                <p className="text-xs text-slate-500">
                  {kpis.isLoading ? "..." : `${kpis.closed.data?.totalanomaliesclosed || 0} / ${kpis.closed.data?.totalAnomalies || 0}`}
                </p>
              </div>
            </div>
            <div>
              <h3 className="font-medium text-slate-900 mb-2">Closing Rate</h3>
              <div className="w-full bg-slate-200 rounded-full h-1.5">
                <div 
                  className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${kpis.closed.data?.percentageWithDates || 0}%` }}
                />
              </div>
            </div>
          </Card>

          {/* Processing Rate */}
          <Card className="p-6 border border-slate-200 bg-white hover:border-slate-300 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-blue-50 rounded-lg border border-blue-100">
                <PlayCircle className="h-5 w-5 text-blue-600" />
              </div>
              <div className="text-right">
                <p className="text-xl font-semibold text-slate-900">
                  {kpis.isLoading ? "..." : `${Math.round(kpis.inProgress.data?.percentageWithDates || 0)}%`}
                </p>
                <p className="text-xs text-slate-500">
                  {kpis.isLoading ? "..." : `${kpis.inProgress.data?.totalanomaliesinprogress || 0} / ${kpis.inProgress.data?.totalAnomalies || 0}`}
                </p>
              </div>
            </div>
            <div>
              <h3 className="font-medium text-slate-900 mb-2">Processing Rate</h3>
              <div className="w-full bg-slate-200 rounded-full h-1.5">
                <div 
                  className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${kpis.inProgress.data?.percentageWithDates || 0}%` }}
                />
              </div>
            </div>
          </Card>

          {/* Average Processing Time */}
          <Card className="p-6 border border-slate-200 bg-white hover:border-slate-300 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-blue-50 rounded-lg border border-blue-100">
                <Timer className="h-5 w-5 text-blue-600" />
              </div>
              <div className="text-right">
                <p className="text-xl font-semibold text-slate-900">
                  {kpis.isLoading ? "..." : 
                    `${kpis.processingTime.data?.averageDays || 0}d ${kpis.processingTime.data?.averageHours || 0}h`
                  }
                </p>
                <p className="text-xs text-slate-500">
                  {kpis.isLoading ? "..." : `${kpis.processingTime.data?.totalAnomalies || 0} anomalies`}
                </p>
              </div>
            </div>
            <div>
              <h3 className="font-medium text-slate-900 mb-2">Avg. Processing Time</h3>
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                <span>Active processing</span>
              </div>
            </div>
          </Card>

          {/* Action Plan Completion Rate */}
          <Card className="p-6 border border-slate-200 bg-white hover:border-slate-300 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-blue-50 rounded-lg border border-blue-100">
                <Target className="h-5 w-5 text-blue-600" />
              </div>
              <div className="text-right">
                <p className="text-xl font-semibold text-slate-900">
                  {kpis.isLoading ? "..." : `${Math.round(actionPlanCompletionRate)}%`}
                </p>
                <p className="text-xs text-slate-500">
                  {kpis.isLoading ? "..." : `${kpis.actionPlan.data?.action.completed || 0} / ${kpis.actionPlan.data?.action.total || 0}`}
                </p>
              </div>
            </div>
            <div>
              <h3 className="font-medium text-slate-900 mb-2">Action Plan Completion</h3>
              <div className="w-full bg-slate-200 rounded-full h-1.5">
                <div 
                  className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${actionPlanCompletionRate}%` }}
                />
              </div>
            </div>
          </Card>
        </div>

        {/* Secondary Information Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Anomaly Overview Card - 6 columns */}
          <Card className="lg:col-span-6 p-6 border border-slate-200 bg-white min-h-[300px]">
            <CardHeader className="p-0 pb-4">
              <CardTitle className="text-lg font-medium text-slate-900 flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                Anomaly Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 space-y-4">
              {kpis.isLoading ? (
                <div className="space-y-4">
                  <div className="h-4 bg-slate-200 rounded animate-pulse" />
                  <div className="h-4 bg-slate-200 rounded animate-pulse" />
                  <div className="h-4 bg-slate-200 rounded animate-pulse" />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-slate-100">
                    <span className="text-base font-medium text-slate-700">Total Anomalies</span>
                    <Badge variant="outline" className="border-blue-200 text-blue-700 bg-blue-50 text-sm px-3 py-1">
                      {(kpis.closed.data?.totalAnomalies || 0).toLocaleString()}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-slate-100">
                    <span className="text-base font-medium text-slate-700">Active</span>
                    <Badge variant="outline" className="border-blue-200 text-blue-700 bg-blue-50 text-sm px-3 py-1">
                      {(kpis.inProgress.data?.totalanomaliesinprogress || 0).toLocaleString()}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center py-3">
                    <span className="text-base font-medium text-slate-700">Resolved</span>
                    <Badge variant="outline" className="border-blue-200 text-blue-700 bg-blue-50 text-sm px-3 py-1">
                      {(kpis.closed.data?.totalanomaliesclosed || 0).toLocaleString()}
                    </Badge>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Maintenance Window KPI Card - 3 columns */}
          <Card className="lg:col-span-3 p-6 border border-slate-200 bg-white min-h-[300px]">
            <CardHeader className="p-0 pb-4">
              <CardTitle className="text-lg font-medium text-slate-900 flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-600" />
                Maintenance Windows
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 space-y-6">
              <div className="text-center">
                <div className="text-3xl font-semibold text-slate-900 mb-2">
                  {kpis.isLoading ? "..." : "12"}
                </div>
                <div className="text-sm text-slate-500">Active Windows</div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">Scheduled</span>
                  <span className="font-medium text-slate-700 text-sm">8</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">In Progress</span>
                  <span className="font-medium text-slate-700 text-sm">4</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">Completed</span>
                  <span className="font-medium text-slate-700 text-sm">23</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions Card - 3 columns */}
          <Card className="lg:col-span-3 p-6 border border-slate-200 bg-white min-h-[300px]">
            <div className="space-y-4 h-full flex flex-col">
              <h3 className="text-lg font-medium text-slate-900 flex items-center gap-2">
                <Settings className="h-5 w-5 text-blue-600" />
                Quick Actions
              </h3>
              <div className="grid grid-cols-1 gap-3 flex-1">
                <Link href="/dashboard/anomalies">
                  <button className="w-full flex items-center justify-between px-4 py-3 text-left text-sm text-slate-700 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 rounded-md transition-colors group">
                    <div className="flex items-center gap-3">
                      <BarChart3 className="h-5 w-5 text-blue-600" />
                      <span>View Anomalies</span>
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-blue-600" />
                  </button>
                </Link>
                <Link href="/dashboard/anomalies?action=create">
                  <button className="w-full flex items-center justify-between px-4 py-3 text-left text-sm text-slate-700 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 rounded-md transition-colors group">
                    <div className="flex items-center gap-3">
                      <Plus className="h-5 w-5 text-blue-600" />
                      <span>Report Anomaly</span>
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-blue-600" />
                  </button>
                </Link>
                <button className="w-full flex items-center justify-between px-4 py-3 text-left text-sm text-slate-700 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 rounded-md transition-colors group">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-blue-600" />
                    <span>System Reports</span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-blue-600" />
                </button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
