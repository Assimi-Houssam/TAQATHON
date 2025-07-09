"use client";

import { DashboardHeader } from "@/components/ui/ocp/DashboardHeader";
import { ExportMenu } from "@/components/ui/ocp/ExportMenu";
import { TimeframeSelect } from "@/components/ui/ocp/TimeframeSelect";
import { KPICard, PercentageKPICard, TimeKPICard } from "@/components/ui/ocp/KPICard";
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

export const Dashboard = () => {
  const t = useTranslations("dashboard");
  const kpis = useAllKPIs();
  const { data: anomaliesData, isLoading: anomaliesLoading } = useAnomalies({
    page: 1,
    limit: 5,
  });

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
      <div className="w-full p-6 space-y-6 max-w-[1600px] mx-auto">
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
        <div className="space-y-4">
          <div className="border-l-4 border-blue-600 pl-4">
            <h2 className="text-xl font-semibold text-slate-900">Key Performance Indicators</h2>
            <p className="text-slate-600 text-sm mt-1">
              Track critical metrics for anomaly management and system performance
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {/* Closing Rate */}
            <PercentageKPICard
              title="Closing Rate"
              percentage={kpis.closed.data?.percentageWithDates || 0}
              total={kpis.closed.data?.totalAnomalies || 0}
              count={kpis.closed.data?.totalanomaliesclosed || 0}
              icon={<CheckCircle2 />}
              isLoading={kpis.isLoading}
            />

            {/* Processing Rate */}
            <PercentageKPICard
              title="Processing Rate"
              percentage={kpis.inProgress.data?.percentageWithDates || 0}
              total={kpis.inProgress.data?.totalAnomalies || 0}
              count={kpis.inProgress.data?.totalanomaliesinprogress || 0}
              icon={<PlayCircle />}
              isLoading={kpis.isLoading}
            />

            {/* Average Processing Time */}
            <TimeKPICard
              title="Average Processing Time"
              hours={kpis.processingTime.data?.averageHours || 0}
              days={kpis.processingTime.data?.averageDays || 0}
              total={kpis.processingTime.data?.totalAnomalies || 0}
              icon={<Timer />}
              isLoading={kpis.isLoading}
            />

            {/* Action Plan Completion Rate */}
            <PercentageKPICard
              title="Action Plan Completion Rate"
              percentage={actionPlanCompletionRate}
              total={kpis.actionPlan.data?.action.total || 0}
              count={kpis.actionPlan.data?.action.completed || 0}
              icon={<Target />}
              isLoading={kpis.isLoading}
            />
          </div>
        </div>

        {/* Secondary Information Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Anomaly Overview Card */}
          <Card className="p-6 border border-slate-200 bg-white">
            <CardHeader className="p-0 pb-4">
              <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                Anomaly Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 space-y-3">
              {kpis.isLoading ? (
                <div className="space-y-3">
                  <div className="h-4 bg-slate-200 rounded animate-pulse" />
                  <div className="h-4 bg-slate-200 rounded animate-pulse" />
                  <div className="h-4 bg-slate-200 rounded animate-pulse" />
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-slate-100">
                    <span className="text-sm font-medium text-slate-700">Total Anomalies</span>
                    <Badge variant="outline" className="border-blue-200 text-blue-700 bg-blue-50">
                      {(kpis.closed.data?.totalAnomalies || 0).toLocaleString()}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-100">
                    <span className="text-sm font-medium text-slate-700">Active</span>
                    <Badge variant="outline" className="border-blue-200 text-blue-700 bg-blue-50">
                      {(kpis.inProgress.data?.totalanomaliesinprogress || 0).toLocaleString()}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm font-medium text-slate-700">Resolved</span>
                    <Badge variant="outline" className="border-blue-200 text-blue-700 bg-blue-50">
                      {(kpis.closed.data?.totalanomaliesclosed || 0).toLocaleString()}
                    </Badge>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* System Status Card */}
          <Card className="p-6 border border-slate-200 bg-white">
            <CardHeader className="p-0 pb-4">
              <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <Monitor className="h-5 w-5 text-blue-600" />
                System Status
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 space-y-3">
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <span className="text-sm font-medium text-slate-700">Operational Status</span>
                  <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                    ● Online
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-slate-600">
                    <span>System Performance</span>
                    <span className="font-medium">96%</span>
                  </div>
                  <Progress value={96} className="h-2" />
                </div>
                <div className="text-xs text-slate-500 pt-2 border-t border-slate-100">
                  Last updated: {new Date().toLocaleTimeString()}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions Card */}
          <Card className="p-6 border border-slate-200 bg-white">
            <CardHeader className="p-0 pb-4">
              <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <Settings className="h-5 w-5 text-blue-600" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 space-y-3">
              <Link href="/dashboard/anomalies" className="block">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-between border-slate-300 hover:bg-blue-50 hover:border-blue-300"
                >
                  View Anomalies
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/dashboard/anomalies?action=create" className="block">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-between border-slate-300 hover:bg-blue-50 hover:border-blue-300"
                >
                  Report Anomaly
                  <Plus className="h-4 w-4" />
                </Button>
              </Link>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-between border-slate-300 hover:bg-blue-50 hover:border-blue-300"
              >
                System Reports
                <BarChart3 className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity Section */}
        <Card className="p-6 border border-slate-200 bg-white">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
            <div className="border-l-4 border-blue-600 pl-4">
              <h2 className="text-xl font-semibold text-slate-900">Recent Anomalies</h2>
              <p className="text-slate-600 text-sm mt-1">
                Latest anomaly detections and status updates
              </p>
            </div>
            <Link href="/dashboard/anomalies">
              <Button variant="outline" size="sm" className="gap-2 border-blue-300 text-blue-700 hover:bg-blue-50">
                View All
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="space-y-2">
            {anomaliesLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-4 p-4 border border-slate-200 rounded-lg">
                  <div className="w-10 h-10 bg-slate-200 rounded-lg animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-200 rounded animate-pulse w-3/4" />
                    <div className="h-3 bg-slate-200 rounded animate-pulse w-1/2" />
                  </div>
                  <div className="w-20 h-6 bg-slate-200 rounded animate-pulse" />
                </div>
              ))
            ) : anomaliesData?.anomalies.length ? (
              anomaliesData.anomalies.slice(0, 5).map((anomaly, index) => (
                <div key={anomaly.id || index} className="flex items-center space-x-4 p-4 border border-slate-200 rounded-lg hover:bg-slate-50">
                  <div className="p-2 bg-blue-50 rounded-lg border border-blue-100">
                    <AlertTriangle className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-slate-900 text-sm">
                        {anomaly.descreption_anomalie || "Anomaly Detected"}
                      </p>
                      <Badge 
                        variant="outline"
                        className={
                          anomaly.criticite === "HIGH" 
                            ? "border-red-200 text-red-700 bg-red-50" :
                          anomaly.criticite === "MEDIUM" 
                            ? "border-yellow-200 text-yellow-700 bg-yellow-50" 
                            : "border-slate-200 text-slate-700 bg-slate-50"
                        }
                      >
                        {anomaly.criticite || "MEDIUM"}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500">
                      {anomaly.num_equipments || "Equipment"} • {anomaly.systeme || "System"} • 
                      {anomaly.date_detection ? new Date(anomaly.date_detection).toLocaleDateString() : "Recent"}
                    </p>
                  </div>
                  <Badge 
                    variant="outline"
                    className={
                      anomaly.status === "CLOSED" 
                        ? "border-blue-200 text-blue-700 bg-blue-50" :
                      anomaly.status === "IN_PROGRESS" 
                        ? "border-yellow-200 text-yellow-700 bg-yellow-50" 
                        : "border-slate-200 text-slate-700 bg-slate-50"
                    }
                  >
                    {anomaly.status || "NEW"}
                  </Badge>
                </div>
              ))
            ) : (
              <div className="text-center py-12 border border-slate-200 rounded-lg">
                <AlertCircle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-500 font-medium">No recent anomalies found</p>
                <p className="text-slate-400 text-sm mt-1">Anomalies will appear here when detected</p>
              </div>
            )}
          </div>
        </Card>

        {/* Footer */}
        <div className="text-center py-4 text-xs text-slate-500 border-t border-slate-200">
          <p>© 2024 TAQATHON Anomaly Management Platform • Enterprise Edition</p>
        </div>
      </div>
    </div>
  );
};
