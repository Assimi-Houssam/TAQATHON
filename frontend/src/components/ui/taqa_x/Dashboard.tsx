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
  LineChart,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import { useState, useEffect } from "react";

// Simple Anomalies Trend Chart Component
const AnomaliesTrendChart = ({ data, isLoading }: { data: any[]; isLoading: boolean }) => {
  if (isLoading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="animate-pulse text-sm text-slate-500">Loading chart...</div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="text-sm text-slate-500">No data available</div>
      </div>
    );
  }

  // Get the last 7 days of data for the chart
  const chartData = data.slice(-7);
  const maxValue = Math.max(...chartData.map(d => Math.max(d.total, d.closed, d.inProgress, d.new)));
  const chartHeight = 180;
  const chartWidth = 500;

  const getYPosition = (value: number) => {
    return chartHeight - (value / maxValue) * chartHeight;
  };

  const getXPosition = (index: number) => {
    return (index / (chartData.length - 1)) * chartWidth;
  };

  const createPathData = (dataKey: string) => {
    return chartData
      .map((d, i) => `${i === 0 ? 'M' : 'L'} ${getXPosition(i)} ${getYPosition(d[dataKey])}`)
      .join(' ');
  };

  return (
    <div className="h-64">
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
            <span className="text-slate-600 font-medium">Total</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
            <span className="text-slate-600 font-medium">Closed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-300 rounded-full"></div>
            <span className="text-slate-600 font-medium">In Progress</span>
          </div>
        </div>
      </div>
      <div className="relative">
        <svg width="100%" height={chartHeight} viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="overflow-visible">
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map(percent => {
            const y = (percent / 100) * chartHeight;
            return (
              <line
                key={percent}
                x1="0"
                y1={y}
                x2={chartWidth}
                y2={y}
                stroke="#f1f5f9"
                strokeWidth="1"
              />
            );
          })}
          
          {/* Total line */}
          <path
            d={createPathData('total')}
            fill="none"
            stroke="#2563eb"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          {/* Closed line */}
          <path
            d={createPathData('closed')}
            fill="none"
            stroke="#60a5fa"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          {/* In Progress line */}
          <path
            d={createPathData('inProgress')}
            fill="none"
            stroke="#93c5fd"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data points */}
          {chartData.map((d, i) => (
            <g key={i}>
              <circle cx={getXPosition(i)} cy={getYPosition(d.total)} r="4" fill="#2563eb" />
              <circle cx={getXPosition(i)} cy={getYPosition(d.closed)} r="3" fill="#60a5fa" />
              <circle cx={getXPosition(i)} cy={getYPosition(d.inProgress)} r="3" fill="#93c5fd" />
            </g>
          ))}
        </svg>
        
        {/* X-axis labels */}
        <div className="flex justify-between mt-4 text-sm text-slate-500">
          {chartData.map((d, i) => (
            <span key={i} className="block">
              {new Date(d.date).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

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



  // Calculate completion rate for action plans
  const actionPlanCompletionRate = kpis.actionPlan.data?.action && kpis.actionPlan.data.action.total > 0
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
                <TimeframeSelect />
                <ExportMenu />
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
                  {kpis.isLoading ? "..." : `${Math.round(actionPlanCompletionRate) || 0}%`}
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
          {/* Anomalies Trend Chart - 6 columns */}
          <Card className="lg:col-span-6 p-6 border border-slate-200 bg-white min-h-[300px]">
            <CardHeader className="p-0 pb-4">
              <CardTitle className="text-lg font-medium text-slate-900 flex items-center gap-2">
                <LineChart className="h-5 w-5 text-blue-600" />
                Anomalies Trend
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <AnomaliesTrendChart 
                data={kpis.chartData.data || []} 
                isLoading={kpis.isLoading} 
              />
            </CardContent>
          </Card>

          {/* Anomaly Overview Card - 3 columns */}
          <Card className="lg:col-span-3 p-6 border border-slate-200 bg-white min-h-[300px]">
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

          {/* Quick Actions Card - 3 columns */}
          <Card className="lg:col-span-3 p-6 border border-slate-200 bg-white min-h-[300px]">
            <div className="h-full flex flex-col">
              <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
                <div className="p-1.5 bg-blue-50 rounded border border-blue-100">
                  <Settings className="h-4 w-4 text-blue-600" />
                </div>
                <h3 className="text-lg font-medium text-slate-900">Quick Actions</h3>
              </div>
              
              <div className="flex-1 py-4 space-y-1">
                <Link href="/dashboard/anomalies" className="block">
                  <div className="flex items-center gap-3 px-3 py-4 text-slate-700 hover:bg-blue-50 hover:text-blue-700 border-l-2 border-transparent hover:border-blue-600 transition-all duration-200 cursor-pointer">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                    <span className="font-medium">View Anomalies</span>
                  </div>
                </Link>
                
                <Link href="/dashboard/anomalies/new" className="block">
                  <div className="flex items-center gap-3 px-3 py-4 text-slate-700 hover:bg-blue-50 hover:text-blue-700 border-l-2 border-transparent hover:border-blue-600 transition-all duration-200 cursor-pointer">
                    <Plus className="h-5 w-5 text-blue-600" />
                    <span className="font-medium">Report Anomaly</span>
                  </div>
                </Link>
                
                <button className="w-full">
                  <div className="flex items-center gap-3 px-3 py-4 text-slate-700 hover:bg-blue-50 hover:text-blue-700 border-l-2 border-transparent hover:border-blue-600 transition-all duration-200 cursor-pointer">
                    <AlertCircle className="h-5 w-5 text-blue-600" />
                    <span className="font-medium">System Reports</span>
                  </div>
                </button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
