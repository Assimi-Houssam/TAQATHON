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



// Mock data for anomaly visualizations
const mockAnomaliesByStatus = [
  {
    name: "New",
    value: 12,
    color: "#3B82F6",
    icon: <AlertTriangle className="h-4 w-4" />,
  },
  {
    name: "In Progress",
    value: 8,
    color: "#F59E0B",
    icon: <Clock className="h-4 w-4" />,
  },
  {
    name: "Resolved",
    value: 25,
    color: "#10B981",
    icon: <CheckCircle className="h-4 w-4" />,
  },
  {
    name: "Escalated",
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
  { name: "Unit E", low: 4, medium: 5, high: 2, critical: 0 },
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
    title: "Investigate Temperature Anomaly - Unit A",
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
    title: "Calibrate Pressure Sensors - Unit C",
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
    title: "Repair Vibration Sensor - Unit B",
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
    title: "Review Anomaly Detection Algorithm",
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

export const OCPDashboard = () => {
  const t = useTranslations("dashboard");
  const { dateRange } = useTimeFrame();
  const iconSize = "h-4 w-4";

  const { data: dashboardData, isLoading: isDashboardLoading } =
    useAgentDashboardData(dateRange);

  const dashboardMetrics = useMemo(() => {
    return [
      {
        title: "Total Anomalies",
        value: "0",
        subtitle: "All detected anomalies",
        icon: <AlertTriangle className={iconSize} />,
        color: "text-blue-600",
        bgColor: "bg-blue-50",
      },
      {
        title: "Critical Anomalies",
        value: "0",
        subtitle: "High priority alerts",
        icon: <AlertOctagon className={iconSize} />,
        color: "text-red-600",
        bgColor: "bg-red-50",
      },
      {
        title: "Resolved Anomalies",
        value: "0",
        subtitle: "Successfully resolved",
        icon: <CheckCircle className={iconSize} />,
        color: "text-green-600",
        bgColor: "bg-green-50",
      },
      {
        title: "Average Resolution Time",
        value: "0",
        subtitle: "Hours to resolve",
        icon: <Clock className={iconSize} />,
        color: "text-purple-600",
        bgColor: "bg-purple-50",
      },
      {
        title: "Anomalies in Progress",
        icon: <Activity className={iconSize} />,
        color: "text-orange-600",
        bgColor: "bg-orange-50",
        subMetrics: [
          {
            value: "0",
            subtitle: "In Investigation",
          },
          {
            value: "0",
            subtitle: "Under Review",
          },
          {
            value: "0",
            subtitle: "Awaiting Action",
          },
          {
            value: "0",
            subtitle: "Escalated",
          },
        ],
      },
    ];
  }, [t]);

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
    a.download = `dashboard-statistics-${
      new Date().toISOString().split("T")[0]
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
    <div className="min-h-screen bg-zinc-50">
      <div className="p-8 space-y-8 max-w-[2000px] mx-auto">
        <DashboardHeader
          title={t("title")}
          subtitle={t("subtitle")}
          action={
            <div className="flex items-center gap-4">
              <TimeframeSelect
                fromYear={new Date().getFullYear() - 20}
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

        <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-5 gap-4 mt-8">
          {isDashboardLoading
            ? Array(5)
                .fill(0)
                .map((_, index) => (
                  <div
                    key={index}
                    className="h-32 bg-white rounded-lg animate-pulse"
                  />
                ))
            : dashboardMetrics.map((item, index) => (
                <MetricsCard key={index} item={item} />
              ))}
        </div>

        <div className="grid grid-cols-1 2xl:grid-cols-2 gap-4 2xl:gap-8 mt-4 2xl:mt-8">
          <DashboardCard
            title="Anomalies by Status"
            icon={<PieChart />}
            className="h-fit"
          >
            {isDashboardLoading ? (
              <div className="h-80 bg-white rounded-lg animate-pulse" />
            ) : (
              <AnomaliesByStatus
                className="h-full border-none"
                data={mockAnomaliesByStatus}
              />
            )}
          </DashboardCard>

          <DashboardCard
            title="Criticality Distribution"
            icon={<Shield />}
            className="h-fit"
          >
            <CriticalityDistribution
              className="h-full border-none shadow-none"
              data={mockCriticalityData}
            />
          </DashboardCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 2xl:gap-8 mt-4 2xl:mt-8">
          <DashboardCard
            title="Anomalies Over Time"
            icon={<TrendingUp />}
            className="h-[500px]"
          >
            <AnomaliesOverTime
              className="border-none shadow-none h-[450px]"
              data={mockAnomaliesOverTime}
            />
          </DashboardCard>

          <DashboardCard
            title="Anomaly Tasks (Maintenance Window)"
            className="h-[500px]"
            icon={<ClipboardList />}
          >
            <AnomalyTasksList 
              className="h-full border-none shadow-none" 
              tasks={mockAnomalyTasks}
            />
          </DashboardCard>
        </div>
      </div>
    </div>
  );
};
