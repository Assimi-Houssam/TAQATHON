"use client";

import { DashboardCard } from "@/components/ui/ocp/DashboardCard";
import { DashboardHeader } from "@/components/ui/ocp/DashboardHeader";
import { DepartmentsChart } from "@/components/ui/ocp/DepartmentsChart";
import { ExportMenu } from "@/components/ui/ocp/ExportMenu";
import { MetricsCard } from "@/components/ui/ocp/MetricsCard";
import { OngoingPurchases } from "@/components/ui/ocp/OngoingPurchases";
import { TimeframeSelect } from "@/components/ui/ocp/TimeframeSelect";
import { TodoList, AddNewTaskButton } from "@/components/ui/ocp/TodoList";
import { TopCompanies } from "@/components/ui/ocp/TopCompanies";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTimeFrame } from "@/context/TimeFrameContext";
import { useGetAllCompanies } from "@/endpoints/company/get-all-companies";
import { Company } from "@/types/entities";
import {
  Building2,
  Factory,
  TableOfContents,
  Users,
  ClipboardList,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { renderToString } from "react-dom/server";
import { useInView } from "react-intersection-observer";
import { utils, write } from "xlsx";
import { useAgentDashboardData } from "@/endpoints/dahboard/ocp/get-agent-dashboard-data";
import Head from "next/head";

interface DisplayCompany {
  name: string;
  bids: number;
  won: number;
  category: string;
  categories: string[];
}

interface ExportMetricsData {
  metrics: Array<{ Title: string; Value: string; Subtitle: string }>;
  companies: Array<{
    Company: string;
    "Total Bids": number;
    "Won Bids": number;
    "Success Rate": string;
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

const prepareDisplayCompanies = (companies: Company[] | undefined) => {
  if (!companies) return [];

  return companies.map((company) => {
    const randomBids = Math.floor(Math.random() * 1000);
    const randomWon = Math.floor(Math.random() * randomBids);
    const categories = company.business_scopes?.map((scope) => scope.name) || [];

    return {
      name: company.legal_name,
      bids: randomBids,
      won: randomWon,
      category: categories.join(", ") || "Uncategorized",
      categories: categories,
    };
  });
};

export const OCPDashboard = () => {
  const t = useTranslations("dashboard");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [allCompanies, setAllCompanies] = useState<Company[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { ref, inView } = useInView();
  const { dateRange } = useTimeFrame();
  const iconSize = "h-4 w-4";

  const { data: dashboardData, isLoading: isDashboardLoading } =
    useAgentDashboardData(dateRange);

  const dashboardMetrics = useMemo(() => {
    if (!dashboardData?.metrics) return [];

    return [
      {
        title: t("metrics.systems.title"),
        value: dashboardData.metrics.companies?.total?.toString() || "1,250",
        subtitle: `${dashboardData.metrics.companies?.active || 1150} monitored systems`,
        icon: <Factory className={iconSize} />,
      },
      {
        title: t("metrics.sensors.title"),
        value: dashboardData.metrics.suppliers?.total?.toString() || "2,300",
        subtitle: `${dashboardData.metrics.suppliers?.active || 2100} active sensors`,
        icon: <Users className={iconSize} />,
      },
      {
        title: t("metrics.anomalies.title"),
        value: dashboardData.metrics.bids?.total?.toString() || "147",
        subtitle: `${dashboardData.metrics.bids?.closed || 23} resolved today`,
        icon: <TableOfContents className={iconSize} />,
      },
      {
        title: t("metrics.alerts.title"),
        value: dashboardData.metrics.agents?.total?.toString() || "42",
        subtitle: `${dashboardData.metrics.agents?.active || 8} critical alerts`,
        icon: <Users className={iconSize} />,
      },
      {
        title: t("metrics.inspections.title"),
        icon: <TableOfContents className={iconSize} />,
        subMetrics: [
          {
            value: dashboardData.metrics.purchaseRequests?.closed?.toString() || "156",
            subtitle: t("metrics.inspections.closed"),
          },
          {
            value: dashboardData.metrics.purchaseRequests?.won?.toString() || "134",
            subtitle: t("metrics.inspections.won"),
          },
          {
            value: dashboardData.metrics.purchaseRequests?.pending?.toString() || "22",
            subtitle: t("metrics.inspections.pending"),
          },
          {
            value: dashboardData.metrics.purchaseRequests?.rejected?.toString() || "12",
            subtitle: t("metrics.inspections.rejected"),
          },
        ],
      },
    ];
  }, [dashboardData?.metrics, t]);

  const {
    data: companiesData,
    isLoading: isLoadingCompanies,
    error: companiesError,
  } = useGetAllCompanies({
    page,
    limit: 10,
    approved: true,
  });

  useEffect(() => {
    if (companiesData?.companies) {
      if (companiesData.companies.length === 0) {
        setHasMore(false);
      } else {
        setAllCompanies((prev) => {
          const newCompanies = companiesData.companies.filter(
            (newCompany: Company) =>
              !prev.some(
                (existingCompany) => existingCompany.id === newCompany.id
              )
          );
          return [...prev, ...newCompanies];
        });
      }
    }
  }, [companiesData?.companies]);

  const loadingRef = useRef(false);

  const loadMoreCompanies = useCallback(async () => {
    if (loadingRef.current || !hasMore || isLoadingCompanies) return;

    try {
      loadingRef.current = true;
      setPage((prev) => prev + 1);
    } finally {
      loadingRef.current = false;
    }
  }, [hasMore, isLoadingCompanies]);

  useEffect(() => {
    if (inView) {
      loadMoreCompanies();
    }
  }, [inView, loadMoreCompanies]);

  useEffect(() => {
    if (companiesError) {
      setError("Failed to load companies");
    } else {
      setError(null);
    }
  }, [companiesError]);

  const handleRetry = () => {
    setError(null);
    setPage(1);
    setAllCompanies([]);
    setHasMore(true);
  };

  const availableCategories = useMemo(() => {
    if (!allCompanies.length) return [];

    const allCategories = allCompanies.flatMap(
      (company: Company) =>
        company.business_scopes?.map((scope) => scope.name) || []
    );

    return Array.from(new Set(allCategories)).sort();
  }, [allCompanies]);

  const DisplayCompanies: DisplayCompany[] =
    prepareDisplayCompanies(allCompanies);

  const mockTasks = [
    {
      title: "Investigate Temperature Anomaly",
      description: "Review temperature spike in Reactor Unit 3 detected at 14:30",
      date: "2024-03-20",
      status: "orange" as const,
    },
    {
      title: "Calibrate Pressure Sensors",
      description: "Quarterly calibration of pressure monitoring sensors",
      date: "2024-03-21",
      status: "blue" as const,
    },
    {
      title: "Update Anomaly Detection Model",
      description: "Update machine learning model with new training data",
      date: "2024-03-22",
      status: "blue" as const,
    },
  ];

  const mockOngoingMonitoring = [
    {
      id: "SYS001",
      title: "Reactor Temperature Monitoring",
      description: "Continuous temperature monitoring for critical reactor systems",
      bidding_deadline: "2024-03-20",
      type: "temperature",
      requesterEntity: "Plant A",
      requesterDepartment: "Reactor Operations",
      requester: "Sarah Johnson",
      status: "active",
    },
    {
      id: "SYS002",
      title: "Vibration Analysis System",
      description: "Real-time vibration monitoring for rotating equipment",
      bidding_deadline: "2024-03-25",
      type: "vibration",
      requesterEntity: "Plant B",
      requesterDepartment: "Mechanical Systems",
      requester: "John Doe",
      status: "active",
    },
    {
      id: "SYS003",
      title: "Chemical Process Monitoring",
      description: "Automated monitoring of chemical process parameters",
      bidding_deadline: "2024-03-28",
      type: "chemical",
      requesterEntity: "Plant C",
      requesterDepartment: "Process Control",
      requester: "Mohammed Ahmed",
      status: "active",
    },
  ];

  const prepareExportData = () => {
    return {
      metrics: dashboardMetrics.map((metric) => ({
        Title: metric.title,
        Value: metric.value,
        Subtitle: metric.subtitle,
      })),
      companies: DisplayCompanies.map((company) => ({
        Company: company.name,
        "Total Bids": company.bids,
        "Won Bids": company.won,
        "Success Rate": `${((company.won / company.bids) * 100).toFixed(1)}%`,
      })),
      tasks: mockTasks.map((task) => ({
        Title: task.title,
        Description: task.description,
        "Due Date": task.date,
        Status: task.status,
      })),
    };
  };

  const handleExportXLSX = () => {
    const wb = utils.book_new();
    const data = prepareExportData();

    // Add each sheet
    utils.book_append_sheet(wb, utils.json_to_sheet(data.metrics), "Metrics");
    utils.book_append_sheet(
      wb,
      utils.json_to_sheet(data.companies),
      "Top Companies"
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
            title={t("departments.title")}
            icon={<TableOfContents />}
            className="h-fit"
          >
            {isDashboardLoading ? (
              <div className="h-80 bg-white rounded-lg animate-pulse" />
            ) : (
              <DepartmentsChart
                className="h-full border-none"
                dateRange={dateRange}
                data={dashboardData?.departments || []}
              />
            )}
          </DashboardCard>

          <DashboardCard
            title={t("ongoingMonitoring.title")}
            icon={<Building2 />}
            className="h-fit"
          >
            <OngoingPurchases
              className="h-full border-none shadow-none"
              purchases={mockOngoingMonitoring}
            />
          </DashboardCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 2xl:gap-8 mt-4 2xl:mt-8">
          <DashboardCard
            title={t("topSystems.title")}
            icon={<Factory />}
            className="h-[500px]"
            action={
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {t("topSystems.allCategories")}
                  </SelectItem>
                  {availableCategories.map((category: unknown) => (
                    <SelectItem
                      key={`category-${String(category)}`}
                      value={String(category).toLowerCase()}
                    >
                      {String(category)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            }
          >
            <TopCompanies
              className="border-none shadow-none h-[400px]"
              companies={DisplayCompanies}
              selectedCategory={selectedCategory}
              hasMore={hasMore}
              isLoading={false}
              observerRef={ref}
              error={error}
              onRetry={handleRetry}
            />
          </DashboardCard>

          <DashboardCard
            title={t("tasks.title")}
            className="h-[500px]"
            icon={<ClipboardList />}
            action={<AddNewTaskButton />}
          >
            <TodoList className="h-full border-none shadow-none" />
          </DashboardCard>
        </div>
      </div>
    </div>
  );
};
