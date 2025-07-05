"use client";

import { DashboardCard } from "@/components/ui/ocp/DashboardCard";
import { DashboardHeader } from "@/components/ui/ocp/DashboardHeader";
import { AnomaliesByStatus } from "@/components/ui/ocp/AnomaliesByStatus";
import { CriticalityDistribution } from "@/components/ui/ocp/CriticalityDistribution";
import { AnomaliesOverTime } from "@/components/ui/ocp/AnomaliesOverTime";
import { AnomalyTasksList } from "@/components/ui/ocp/AnomalyTasksList";
import { ExportMenu } from "@/components/ui/ocp/ExportMenu";
import { MetricsCard } from "@/components/ui/ocp/MetricsCard";
import { TimeframeSelect } from "@/components/ui/ocp/TimeframeSelect";
import { useTimeFrame } from "@/context/TimeFrameContext";
import {
  ClipboardList,
  AlertTriangle,
  AlertOctagon,
  CheckCircle,
  Clock,
  Activity,
  PieChart,
  TrendingUp,
  Shield,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo } from "react";
import { renderToString } from "react-dom/server";
import { utils, write } from "xlsx";
import { useAgentDashboardData } from "@/endpoints/dahboard/ocp/get-agent-dashboard-data";
import Head from "next/head";

interface MonitoringSystem {
  title: string;
  description: string;
  bidding_deadline: string;
  type: string;
  requesterEntity: string;
  requesterDepartment: string;
  requester: string;
  status: string;
  id: string;
}

interface ExportMetricsData {
  metrics: Array<{ Title: string; Value: string; Subtitle: string }>;
  systems: Array<{
    System: string;
    "Total Sensors": number;
    "Operational Sensors": number;
    "Efficiency Rate": string;
  }>;
  tasks: Array<{
    Title: string;
    Description: string;
    "Due Date": string;
    Status: string;
  }>;
}

const PrintContent = ({ data }: { data: ExportMetricsData }) => (
  <html>
    <Head>
      <title>Dashboard Statistics</title>
      <style>{`
        body {
          font-family: Arial, sans-serif;
          padding: 20px;
          max-width: 800px;
          margin: 0 auto;
        }
        .section {
          margin-bottom: 30px;
        }
        h1 {
          color: #333;
          border-bottom: 2px solid #eee;
          padding-bottom: 10px;
        }
        h2 {
          color: #666;
          margin-top: 20px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 10px;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: left;
        }
        th {
          background-color: #f5f5f5;
        }
        @media print {
          body { padding: 0; }
          button { display: none; }
        }
      `}</style>
    </Head>
    <body>
      <h1>Dashboard Statistics - {new Date().toLocaleDateString()}</h1>

      {Object.entries(data).map(([section, items]) => (
        <div key={section} className="section">
          <h2>{section.charAt(0).toUpperCase() + section.slice(1)}</h2>
          <table>
            <thead>
              <tr>
                {Object.keys(items[0] || {}).map((header) => (
                  <th key={header}>{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map(
                (item: Record<string, string | number>, idx: number) => (
                  <tr key={idx}>
                    {Object.values(item).map((value, i) => (
                      <td key={i}>{String(value)}</td>
                    ))}
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      ))}
    </body>
  </html>
);



export const Dashboard = () => {
  const t = useTranslations("dashboard");
  const { dateRange } = useTimeFrame();
  const iconSize = "h-4 w-4";

  const { data: dashboardData, isLoading: isDashboardLoading } =
    useAgentDashboardData(dateRange);

  // Mock data for anomaly visualizations with translations
  const mockAnomaliesByStatus = [
    {
      name: t("charts.anomaliesByStatus.new"),
      value: 12,
      color: "#3B82F6",
      icon: <AlertTriangle className="h-4 w-4" />,
    },
    {
      name: t("charts.anomaliesByStatus.inProgress"),
      value: 8,
      color: "#F59E0B",
      icon: <Clock className="h-4 w-4" />,
    },
    {
      name: t("charts.anomaliesByStatus.resolved"),
      value: 25,
      color: "#10B981",
      icon: <CheckCircle className="h-4 w-4" />,
    },
    {
      name: t("charts.anomaliesByStatus.escalated"),
      value: 3,
      color: "#EF4444",
      icon: <AlertOctagon className="h-4 w-4" />,
    },
  ];

  const mockCriticalityData = [
    { name: "Unit A", low: 5, medium: 3, high: 2, critical: 1 },
    { name: "Unit B", low: 8, medium: 4, high: 1, critical: 0 },
    { name: "Unit C", low: 2, medium: 6, high: 4, critical: 2 },
    { name: "Unit D", low: 7, medium: 2, high: 3, critical: 1 },
    { name: "Unit E", low: 4, medium: 5, high: 2, critical: 0 },
    { name: "Unit F", low: 6, medium: 3, high: 1, critical: 0 },
  ];

  const mockAnomaliesOverTime = [
    { date: "2024-01-01", anomalies: 15, resolved: 12, critical: 3 },
    { date: "2024-01-02", anomalies: 18, resolved: 15, critical: 2 },
    { date: "2024-01-03", anomalies: 22, resolved: 18, critical: 4 },
    { date: "2024-01-04", anomalies: 19, resolved: 16, critical: 3 },
    { date: "2024-01-05", anomalies: 25, resolved: 20, critical: 5 },
    { date: "2024-01-06", anomalies: 21, resolved: 19, critical: 2 },
    { date: "2024-01-07", anomalies: 17, resolved: 15, critical: 2 },
  ];

  const mockAnomalyTasks = [
    {
      id: "1",
      title: `${t("charts.anomalyTasks.investigation")} - Unit A`,
      description: "Temperature sensor showing irregular readings above normal thresholds",
      priority: "high" as const,
      status: "pending" as const,
      assignee: "John Smith",
      department: "Manufacturing",
      createdAt: "2024-01-07T10:00:00Z",
      dueDate: "2024-01-08T18:00:00Z",
      type: "investigation" as const,
    },
    {
      id: "2",
      title: `${t("charts.anomalyTasks.calibration")} - Unit C`,
      description: "Scheduled calibration for pressure monitoring system",
      priority: "medium" as const,
      status: "in_progress" as const,
      assignee: "Sarah Johnson",
      department: "Quality Control",
      createdAt: "2024-01-06T14:30:00Z",
      dueDate: "2024-01-09T12:00:00Z",
      type: "calibration" as const,
    },
    {
      id: "3",
      title: `${t("charts.anomalyTasks.repair")} - Unit B`,
      description: "Vibration sensor requires immediate replacement",
      priority: "critical" as const,
      status: "in_progress" as const,
      assignee: "Mike Davis",
      department: "Maintenance",
      createdAt: "2024-01-07T08:15:00Z",
      dueDate: "2024-01-07T20:00:00Z",
      type: "repair" as const,
    },
    {
      id: "4",
      title: `${t("charts.anomalyTasks.review")} Algorithm`,
      description: "Analyze recent false positive rates and adjust thresholds",
      priority: "low" as const,
      status: "completed" as const,
      assignee: "Emily Chen",
      department: "Data Science",
      createdAt: "2024-01-05T11:00:00Z",
      dueDate: "2024-01-07T17:00:00Z",
      type: "review" as const,
    },
  ];

  const dashboardMetrics = useMemo(() => {
    return [
      {
        title: t("metrics.criticalAlerts.title"),
        value: "3",
        subtitle: `3 ${t("metrics.criticalAlerts.subtitle")}`,
        icon: <AlertOctagon className={iconSize} />,
        color: "text-red-600",
        bgColor: "bg-red-50",
      },
      {
        title: t("metrics.resolvedAnomalies.title"),
        value: "25",
        subtitle: t("metrics.resolvedAnomalies.subtitle"),
        icon: <CheckCircle className={iconSize} />,
        color: "text-green-600",
        bgColor: "bg-green-50",
      },
      {
        title: t("metrics.averageResolutionTime.title"),
        value: "4.2h",
        subtitle: t("metrics.averageResolutionTime.subtitle"),
        icon: <Clock className={iconSize} />,
        color: "text-blue-600",
        bgColor: "bg-blue-50",
      },
      {
        title: t("metrics.systemStatus.title"),
        value: "92%",
        subtitle: t("metrics.systemStatus.subtitle"),
        icon: <Activity className={iconSize} />,
        color: "text-green-600",
        bgColor: "bg-green-50",
      },
    ];
  }, [iconSize, t]);

  const cleanMonitoringSystems: MonitoringSystem[] = [];

  const prepareExportData = () => {
    return {
      metrics: dashboardMetrics.map((metric: any) => ({
        Title: metric.title,
        Value: metric.value,
        Subtitle: metric.subtitle,
      })),
      systems: [],
      tasks: [],
    };
  };

  const handleExportXLSX = () => {
    const wb = utils.book_new();
    const data = prepareExportData();

    // Add each sheet
    utils.book_append_sheet(wb, utils.json_to_sheet(data.metrics), "Metrics");
    utils.book_append_sheet(
      wb,
      utils.json_to_sheet(data.systems),
      "Industrial Systems"
    );
    utils.book_append_sheet(wb, utils.json_to_sheet(data.tasks), "Tasks");

    const wbout = write(wb, { bookType: "xlsx", type: "binary" });
    downloadFile(s2ab(wbout), "xlsx");
  };

  const handleExportJSON = () => {
    const data = prepareExportData();
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    downloadFile(blob, "json");
  };

  const handleExportCSV = () => {
    const data = prepareExportData();
    let csvContent = "";

    // Convert each section to CSV
    Object.entries(data).forEach(([section, items]) => {
      csvContent += `\n${section.toUpperCase()}\n`;
      if (items.length > 0) {
        const headers = Object.keys(items[0]);
        csvContent += headers.join(",") + "\n";
        items.forEach((item) => {
          csvContent +=
            headers
              .map((header) => `"${String(item[header as keyof typeof item])}"`)
              .join(",") + "\n";
        });
      }
    });

    const blob = new Blob([csvContent], { type: "text/csv" });
    downloadFile(blob, "csv");
  };

  const handlePrint = () => {
    const data = prepareExportData();
    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    document.body.appendChild(iframe);

    const content = renderToString(
      <PrintContent data={data as ExportMetricsData} />
    );
    iframe.contentWindow?.document.write(content);
    iframe.contentWindow?.document.close();

    iframe.contentWindow?.print();
    setTimeout(() => {
      document.body.removeChild(iframe);
    }, 100);
  };

  const downloadFile = (content: ArrayBuffer | Blob, extension: string) => {
    const blob =
      content instanceof Blob
        ? content
        : new Blob([content], { type: "application/octet-stream" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dashboard-statistics-${new Date().toISOString().split("T")[0]
      }.${extension}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Utility function to convert string to ArrayBuffer
  const s2ab = (s: string) => {
    const buf = new ArrayBuffer(s.length);
    const view = new Uint8Array(buf);
    for (let i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xff;
    return buf;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50/80"
      style={{
        background: `
             radial-gradient(circle at 20% 20%, rgba(99, 102, 241, 0.03) 0%, transparent 50%),
             radial-gradient(circle at 80% 80%, rgba(16, 185, 129, 0.03) 0%, transparent 50%),
             linear-gradient(135deg, #f8fafc 0%, #ffffff 50%, #f1f5f9 100%)
           `
      }}>

      {/* Unified Design System CSS Variables */}
      <style jsx>{`
         .dashboard-card {
           background: rgba(255, 255, 255, 0.7);
           backdrop-filter: blur(10px);
           border: 1px solid rgba(226, 232, 240, 0.6);
           border-radius: 0.25rem;
           transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
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
           background: linear-gradient(90deg, transparent, rgba(99, 102, 241, 0.1), transparent);
           opacity: 0;
           transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
         }
         
         .dashboard-card:hover {
           border-color: rgba(99, 102, 241, 0.1);
         }
         
         .dashboard-card:hover::before {
           opacity: 1;
         }
         
         .metric-card {
           background: rgba(255, 255, 255, 0.8);
           backdrop-filter: blur(8px);
           border: 1px solid rgba(226, 232, 240, 0.6);
           border-radius: 0.25rem;
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
           transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
         }
         
         .metric-card:hover {
         }
         
         .metric-card:hover::after {
           opacity: 0.1;
         }
         
         .loading-skeleton {
           background: linear-gradient(
             90deg,
             rgba(255, 255, 255, 0.8) 0%,
             rgba(255, 255, 255, 0.9) 50%,
             rgba(255, 255, 255, 0.8) 100%
           );
           background-size: 200px 100%;
           animation: loading 1.5s infinite;
         }
         
         @keyframes loading {
           0% {
             background-position: -200px 0;
           }
           100% {
             background-position: calc(200px + 100%) 0;
           }
         }
         
         .dashboard-icon {
           transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
           position: relative;
         }
         
         .dashboard-icon::before {
           content: '';
           position: absolute;
           inset: -4px;
           background: radial-gradient(circle, currentColor 0%, transparent 70%);
           opacity: 0;
           border-radius: 50%;
           transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
         }
         
         .dashboard-card:hover .dashboard-icon::before {
           opacity: 0.05;
         }
       `}</style>

      <div className="p-6 space-y-6 max-w-[2000px] mx-auto">
        {/* Header with unified styling */}
        <div className="dashboard-card p-6">
          <DashboardHeader
            title={t("title")}
            subtitle={t("subtitle")}
            action={
              <div className="flex items-center">
                <div className="p-2">
                  <TimeframeSelect
                    fromYear={new Date().getFullYear() - 20}
                    toYear={new Date().getFullYear()}
                  />
                </div>
                <div className="p-2">
                  <ExportMenu
                    onExportXLSX={handleExportXLSX}
                    onExportJSON={handleExportJSON}
                    onExportCSV={handleExportCSV}
                    onPrint={handlePrint}
                  />
                </div>
              </div>
            }
          />
        </div>

        {/* Metrics Cards Grid with unified styling */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
          {isDashboardLoading
            ? Array(4)
              .fill(0)
              .map((_, index) => (
                <div
                  key={index}
                  className="metric-card h-32 loading-skeleton"
                />
              ))
            : dashboardMetrics.map((item, index) => (
              <div key={index} className="metric-card p-4 group">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-sm font-medium text-slate-700 group-hover:text-slate-900 transition-colors">
                    {item.title}
                  </h3>
                  <div className={`p-2 rounded-lg ${item.bgColor} dashboard-icon`}>
                    <span className={`${item.color} text-sm`}>{item.icon}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-slate-900 leading-none">
                    {item.value}
                  </div>
                  <div className="text-xs text-slate-500">
                    {item.subtitle}
                  </div>
                </div>
              </div>
            ))}
        </div>

        {/* First Row of Charts with unified styling */}
        <div className="grid grid-cols-1 2xl:grid-cols-2 gap-6">
          <div className="dashboard-card p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="dashboard-icon">
                <PieChart className="h-5 w-5 text-slate-600" />
              </div>
              <h2 className="text-lg font-semibold text-slate-900">{t("charts.anomaliesByStatus.title")}</h2>
            </div>
            {isDashboardLoading ? (
              <div className="h-80 loading-skeleton rounded-lg" />
            ) : (
              <div className="h-80">
                <AnomaliesByStatus
                  className="h-full border-none shadow-none bg-transparent"
                  data={mockAnomaliesByStatus}
                />
              </div>
            )}
          </div>

          <div className="dashboard-card p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="dashboard-icon">
                <Shield className="h-5 w-5 text-slate-600" />
              </div>
              <h2 className="text-lg font-semibold text-slate-900">{t("charts.criticalityDistribution.title")}</h2>
            </div>
            {isDashboardLoading ? (
              <div className="h-80 loading-skeleton rounded-lg" />
            ) : (
              <div className="h-80">
                <CriticalityDistribution
                  className="h-full border-none shadow-none bg-transparent"
                  data={mockCriticalityData}
                />
              </div>
            )}
          </div>
        </div>

        {/* Second Row of Charts with unified styling */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="dashboard-card p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="dashboard-icon">
                <TrendingUp className="h-5 w-5 text-slate-600" />
              </div>
              <h2 className="text-lg font-semibold text-slate-900">{t("charts.anomaliesOverTime.title")}</h2>
            </div>
            {isDashboardLoading ? (
              <div className="h-96 loading-skeleton rounded-lg" />
            ) : (
              <div className="h-96">
                <AnomaliesOverTime
                  className="border-none shadow-none bg-transparent h-full"
                  data={mockAnomaliesOverTime}
                />
              </div>
            )}
          </div>

          <div className="dashboard-card p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="dashboard-icon">
                <ClipboardList className="h-5 w-5 text-slate-600" />
              </div>
              <h2 className="text-lg font-semibold text-slate-900">{t("charts.anomalyTasks.title")}</h2>
            </div>
            {isDashboardLoading ? (
              <div className="h-96 loading-skeleton rounded-lg" />
            ) : (
              <div className="h-96">
                <AnomalyTasksList
                  className="h-full border-none shadow-none bg-transparent"
                  tasks={mockAnomalyTasks}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
