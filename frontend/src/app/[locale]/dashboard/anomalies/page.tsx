"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, AlertTriangle, FileText, Wrench } from "lucide-react";
import { DataTable } from "@/components/data-table";
import { Column, DataTableConfig } from "@/components/data-table/types";
import { useRouter } from "next/navigation";
import { Anomaly, AnomalyStatus, getCriticalityLevel } from "@/types/anomaly";
import { AnomalyStatus as AnomalyStatusComponent, AnomalyCriticalityIndicator } from "@/components/anomaly";
import { useAnomalies } from "@/hooks/useAnomalies";

// Helper function to get criticality filter value
const getCriticalityFilterValue = (criticality?: string): string => {
  const criticalityValue = parseFloat(criticality || '0') || 0;
  if (criticalityValue >= 13) return 'critical';
  if (criticalityValue >= 10) return 'high';
  if (criticalityValue >= 7) return 'medium';
  return 'low';
};

// TODO: Replace with API call to fetch anomalies from backend
// const { data: anomalies = [], isLoading, error } = useAnomalies();

// Helper function to calculate red color opacity based on value (1-5 scale)
const getRedOpacity = (value?: string): string => {
  const numValue = parseFloat(value || '0') || 0;
  // Only values 4 and 5 should be red (less colored), others transparent
  if (numValue === 4 || numValue === 5) {
    return 'rgba(239, 68, 68, 0.15)'; // 30% red for values 4 and 5 (less colored)
  }
  return 'transparent'; // values 1, 2, 3 stay transparent
};

// Helper function to get criticality indicator color
const getCriticalityIndicatorColor = (criticality?: string): string => {
  const level = getCriticalityLevel(criticality);
  
  switch (level) {
    case 'CRITICAL':
      return 'bg-red-500';
    case 'HIGH':
      return 'bg-orange-500';
    case 'MEDIUM':
      return 'bg-yellow-400';
    case 'LOW':
      return 'bg-zinc-400';
    default:
      return 'bg-gray-300';
  }
};

// Column definitions using new components - reordered and enhanced
const columns: Column<Anomaly>[] = [
  {
    id: "num_equipments",
    header: "Equipment ID",
    accessorKey: "num_equipments",
    cell: ({ row }) => (
      <div className="font-mono text-sm font-medium text-zinc-900">
        {row.original.num_equipments}
      </div>
    ),
    size: 120,
    enableSorting: true,
    enableHiding: false, // Always visible
  },
  {
    id: "systeme",
    header: "System",
    accessorKey: "systeme",
    cell: ({ row }) => (
      <div className="max-w-[200px]">
        <div className="font-medium text-zinc-900 truncate" title={row.original.systeme || ""}>
          {row.original.systeme || "N/A"}
        </div>
      </div>
    ),
    size: 200,
    enableSorting: true,
    enableHiding: false, // Always visible
  },
  {
    id: "descreption_anomalie",
    header: "Description",
    accessorKey: "descreption_anomalie",
    cell: ({ row }) => (
      <div className="max-w-[300px]">
        <div className="text-sm text-zinc-600 truncate" title={row.original.descreption_anomalie || ""}>
          {row.original.descreption_anomalie || "No description"}
        </div>
      </div>
    ),
    size: 300,
    enableSorting: false,
    enableHiding: false, // Always visible
  },
  {
    id: "process_safty",
    header: "Process Safety",
    accessorKey: "process_safty",
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <div 
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: getRedOpacity(row.original.process_safty) }}
        >
          <span className="text-sm font-medium text-zinc-900">
            {row.original.process_safty || "0"}
          </span>
        </div>
      </div>
    ),
    size: 120,
    enableSorting: true,
    enableHiding: false, // Always visible
  },
  {
    id: "fiablite_integrite",
    header: "Reliability",
    accessorKey: "fiablite_integrite",
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <div 
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: getRedOpacity(row.original.fiablite_integrite) }}
        >
          <span className="text-sm font-medium text-zinc-900">
            {row.original.fiablite_integrite || "0"}
          </span>
        </div>
      </div>
    ),
    size: 120,
    enableSorting: true,
    enableHiding: false, // Always visible
  },
  {
    id: "disponsibilite",
    header: "Availability",
    accessorKey: "disponsibilite",
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <div 
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: getRedOpacity(row.original.disponsibilite) }}
        >
          <span className="text-sm font-medium text-zinc-900">
            {row.original.disponsibilite || "0"}
          </span>
        </div>
      </div>
    ),
    size: 120,
    enableSorting: true,
    enableHiding: false, // Always visible
  },
  {
    id: "Criticite",
    header: "Criticality",
    accessorKey: "Criticite",
    cell: ({ row }) => {
      // Check if this is a fake row (padding row)
      const isFakeRow = row.original && typeof row.original === 'object' && '__isFakeRow' in row.original;
      
      if (isFakeRow) {
        return (
          <div className="flex items-center justify-center">
            <span className="text-zinc-400">-</span>
          </div>
        );
      }
      
      return (
        <div className="flex items-center justify-center">
          <AnomalyCriticalityIndicator 
            criticality={parseFloat(row.original.Criticite || '0') || 0}
            variant="badge"
          />
        </div>
      );
    },
    size: 140,
    enableSorting: true,
    enableHiding: false, // Always visible
  },
  {
    id: "status",
    header: "Status",
    accessorKey: "status",
    cell: ({ row }) => (
      <div className="text-center">
        <AnomalyStatusComponent 
          status={row.original.status || 'NEW'}
        />
      </div>
    ),
    size: 150,
    enableSorting: true,
    enableHiding: false, // Always visible
  },
  {
    id: "date_detection",
    header: "Date Detected",
    accessorKey: "date_detection",
    cell: ({ row }) => (
      <div className="text-sm text-zinc-600">
        {row.original.date_detection ? new Date(row.original.date_detection).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        }) : "No date"}
      </div>
    ),
    size: 120,
    enableSorting: true,
    enableHiding: true, // Can be hidden
  },
  {
    id: "origine",
    header: "Origin",
    accessorKey: "origine",
    cell: ({ row }) => (
      <div className="text-sm text-zinc-600">
        {row.original.origine || "Unknown"}
      </div>
    ),
    size: 150,
    enableSorting: true,
    enableHiding: true, // Can be hidden
  },

  {
    id: "criticality_indicator",
    header: "",
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <div 
          className={`w-1 h-8 rounded-full ${getCriticalityIndicatorColor(row.original.Criticite)}`}
          title={getCriticalityLevel(row.original.Criticite)}
        />
      </div>
    ),
    size: 20,
    enableSorting: false,
    enableHiding: false,
  },
];

// Data table configuration
const config: DataTableConfig<Anomaly> = {
  enableSorting: true,
  enableColumnVisibility: true,
  enableSearch: true,
  enableFilters: true,
  enablePagination: true,
  pageSize: 10,
  searchPlaceholder: "Search anomalies...",
  searchableColumns: ["num_equipments", "systeme", "descreption_anomalie", "origine"],
  // Default sorting: Critical anomalies first (highest criticality first)
  defaultSort: {
    field: "Criticite",
    direction: "desc", // Descending order (highest criticality first)
  },
  // Default visible columns (most important ones in new order)
  defaultColumnVisibility: {
    num_equipments: true,
    systeme: true,
    descreption_anomalie: true,
    process_safty: true, // Now visible by default
    fiablite_integrite: true, // Now visible by default
    disponsibilite: true, // Now visible by default
    Criticite: true,
    status: true,
    date_detection: false, // Hidden by default
    origine: false, // Hidden by default
    criticality_indicator: true, // Always visible, now last
  },
};

// Define filters for the new interface with updated criticality ranges
const filters = [
  {
    key: "status",
    label: "Status",
    options: [
      { value: "New", label: "New" },
      { value: "In Progress", label: "In Progress" },
      { value: "Closed", label: "Closed" },
    ],
  },
  {
    key: "criticality_filter",
    label: "Criticality",
    options: [
      { value: "critical", label: "Critical (13-15)" },
      { value: "high", label: "High (10-12)" },
      { value: "medium", label: "Medium (7-9)" },
      { value: "low", label: "Low (3-6)" },
    ],
  },
  {
    key: "origine",
    label: "Origin",
    options: [
      { value: "Oracle", label: "Oracle" },
      { value: "APM", label: "APM" },
      { value: "IBM Maximo", label: "IBM Maximo" },
      { value: "EMC", label: "EMC" },
    ],
  },
];



export default function AnomaliesPage() {
  const router = useRouter();

  // Fetch anomalies from backend
  const { data, isLoading, error } = useAnomalies();
  const anomalies = data?.anomalies || [];

  // Add computed criticality filter field to the data
  const processedAnomalies = useMemo(() => {
    return anomalies.map((anomaly: Anomaly) => ({
      ...anomaly,
      criticality_filter: getCriticalityFilterValue(anomaly.Criticite)
    }));
  }, [anomalies]);

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-6 py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-zinc-900">Anomaly Management</h1>
            <p className="text-zinc-600 mt-1">Monitor equipment anomalies with detailed criticality assessment</p>
          </div>
        </div>
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-zinc-600 mt-4">Loading anomalies...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto px-6 py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-zinc-900">Anomaly Management</h1>
            <p className="text-zinc-600 mt-1">Monitor equipment anomalies with detailed criticality assessment</p>
          </div>
        </div>
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-zinc-900 mb-2">Error Loading Anomalies</h2>
            <p className="text-zinc-600 mb-4">There was an error loading the anomaly data. Please try again.</p>
            <Button onClick={() => window.location.reload()}>
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">Anomaly Management</h1>
          <p className="text-zinc-600 mt-1">Monitor equipment anomalies with detailed criticality assessment</p>
        </div>
        <div className="flex gap-3">
        <Button 
            onClick={() => router.push("/dashboard/anomalies/new")}
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Anomalies
          </Button>
        </div>
      </div>

      {/* Data Table */}
      <div className="overflow-hidden">
        <DataTable
          data={processedAnomalies}
          columns={columns}
          config={config}
          filters={filters}
                      onRowClick={(anomaly) => router.push(`/dashboard/anomalies/detail?id=${anomaly.id}`)}
            className="w-full"
          />
        </div>
      </div>
    );
  }