"use client";

import { DashboardHeader } from "@/components/ui/ocp/DashboardHeader";
import { ExportMenu } from "@/components/ui/ocp/ExportMenu";
import { TimeframeSelect } from "@/components/ui/ocp/TimeframeSelect";
import {
  LayoutDashboard,
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
    <div className="w-full">
      {/* Modern Design System Styles */}
      <style jsx>{`
        .dashboard-card {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(226, 232, 240, 0.8);
          border-radius: 12px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }
        
        .dashboard-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.1), transparent);
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        
        .dashboard-card:hover {
          transform: translateY(-1px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
          border-color: rgba(59, 130, 246, 0.2);
        }
        
        .dashboard-card:hover::before {
          opacity: 1;
        }
        
        .metric-card {
          background: rgba(255, 255, 255, 0.95);
          border: 1px solid rgba(226, 232, 240, 0.6);
          border-radius: 8px;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }
        
        .metric-card::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, currentColor, transparent);
          opacity: 0;
          transition: opacity 0.2s ease;
        }
        
        .metric-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        
        .metric-card:hover::after {
          opacity: 0.1;
        }
        
        .placeholder-section {
          background: rgba(255, 255, 255, 0.6);
          border: 2px dashed rgba(59, 130, 246, 0.2);
          border-radius: 12px;
          transition: all 0.2s ease;
        }
        
        .placeholder-section:hover {
          border-color: rgba(59, 130, 246, 0.4);
          background: rgba(255, 255, 255, 0.8);
        }
        
        .icon-wrapper {
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(59, 130, 246, 0.05));
          border-radius: 8px;
          padding: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }
        
        .icon-wrapper:hover {
          transform: scale(1.05);
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(59, 130, 246, 0.08));
        }
      `}</style>

      <div className="p-4 md:p-6 lg:p-8 space-y-6 md:space-y-8 w-full">
        {/* Header Section */}
        <div className="dashboard-card p-4 md:p-6">
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
        </div>

        {/* Quick Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {[
            {
              title: "Total Anomalies",
              value: "—",
              subtitle: "Ready for integration",
              icon: <AlertTriangle className="h-5 w-5 text-blue-600" />,
              bgColor: "bg-blue-50",
            },
            {
              title: "System Status",
              value: "—",
              subtitle: "Monitoring ready",
              icon: <Activity className="h-5 w-5 text-green-600" />,
              bgColor: "bg-green-50",
            },
            {
              title: "Response Time",
              value: "—",
              subtitle: "Analytics pending",
              icon: <Clock className="h-5 w-5 text-amber-600" />,
              bgColor: "bg-amber-50",
            },
            {
              title: "Resolved",
              value: "—",
              subtitle: "Tracking enabled",
              icon: <CheckCircle className="h-5 w-5 text-emerald-600" />,
              bgColor: "bg-emerald-50",
            },
          ].map((metric, index) => (
            <div key={index} className="metric-card p-4 md:p-6 group">
              <div className="flex items-center justify-between mb-4">
                <div className="icon-wrapper">
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
              <h3 className="text-sm font-medium text-slate-700 group-hover:text-slate-900 transition-colors">
                {metric.title}
              </h3>
            </div>
          ))}
        </div>

        {/* Main Content Grid - Placeholder Sections */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 md:gap-8">
          {/* Anomaly Analytics Placeholder */}
          <div className="placeholder-section p-6 md:p-8 text-center">
            <div className="flex flex-col items-center space-y-4">
              <div className="icon-wrapper">
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
                              <div className="text-xs text-slate-500 font-mono bg-slate-50 px-3 py-1 rounded-full">
                  {/* TODO: Add AnomalyChart component */}
                </div>
            </div>
          </div>

          {/* System Overview Placeholder */}
          <div className="placeholder-section p-6 md:p-8 text-center">
            <div className="flex flex-col items-center space-y-4">
              <div className="icon-wrapper">
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
                              <div className="text-xs text-slate-500 font-mono bg-slate-50 px-3 py-1 rounded-full">
                  {/* TODO: Add SystemOverview component */}
                </div>
            </div>
          </div>
        </div>

        {/* Action Items Section */}
        <div className="dashboard-card p-4 md:p-6">
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
              <Card key={index} className="border-slate-200 hover:border-blue-200 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className="icon-wrapper mt-1">
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
        </div>

        {/* Developer Notes Section */}
        <div className="dashboard-card p-4 md:p-6 bg-slate-50/50 border-slate-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="icon-wrapper">
              <LayoutDashboard className="h-5 w-5 text-slate-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">
              Development Notes
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-700">
            <div className="space-y-3">
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                <p>
                  <strong>Layout Foundation:</strong> Clean, responsive structure ready for anomaly components
                </p>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0"></div>
                <p>
                  <strong>Design System:</strong> Modern white/blue theme with consistent spacing and typography
                </p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 rounded-full bg-amber-500 mt-2 flex-shrink-0"></div>
                <p>
                  <strong>Component Slots:</strong> Placeholder sections marked for future chart and data integrations
                </p>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 rounded-full bg-purple-500 mt-2 flex-shrink-0"></div>
                <p>
                  <strong>Scalability:</strong> Grid system supports responsive layouts and component expansion
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="text-center py-4 text-xs text-slate-500">
          <p>© 2024 TAQATHON Anomaly Management Platform • Ready for Production</p>
        </div>
      </div>
    </div>
  );
};
