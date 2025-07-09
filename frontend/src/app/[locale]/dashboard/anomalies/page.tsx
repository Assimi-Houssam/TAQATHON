"use client";

import { useMemo, useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, AlertTriangle, FileText, Wrench } from "lucide-react";
import { DataTable, ServerSideConfig } from "@/components/data-table";
import { Column, DataTableConfig } from "@/components/data-table/types";
import { useRouter } from "next/navigation";
import { Anomaly, AnomalyStatus, getCriticalityLevel } from "@/types/anomaly";
import { AnomalyStatus as AnomalyStatusComponent, AnomalyCriticalityIndicator } from "@/components/anomaly";
import { useAnomalies } from "@/hooks/useAnomalies";

// Filter mapping functions
const mapFrontendStatusToBackend = (frontendStatus: string): string => {
  const statusMap: Record<string, string> = {
    'New': 'NEW',
    'In Progress': 'IN_PROGRESS', 
    'Closed': 'CLOSED'
  };
  return statusMap[frontendStatus] || frontendStatus;
};

const mapFrontendCriticalityToBackend = (frontendCriticality: string): string => {
  const criticalityMap: Record<string, string> = {
    'critical': 'HIGH',
    'high': 'HIGH', 
    'medium': 'MEDIUM',
    'low': 'LOW'
  };
  return criticalityMap[frontendCriticality] || frontendCriticality;
};

// Map origine values to backend section values
const mapOrigineToSection = (origine: string): string => {
  const origineMap: Record<string, string> = {
    'Oracle': 'MC',
    'APM': 'MM',
    'IBM Maximo': 'MD',
    'EMC': 'CT'
  };
  return origineMap[origine] || '';
};

// Convert frontend filters to backend format
const mapFiltersToBackend = (frontendFilters: Record<string, string>) => {
  const backendFilters: Record<string, string> = {};
  
  Object.entries(frontendFilters).forEach(([key, value]) => {
    if (!value) return;
    
    switch (key) {
      case 'status':
        backendFilters.status = mapFrontendStatusToBackend(value);
        break;
      case 'criticality_filter':
        backendFilters.criticity = mapFrontendCriticalityToBackend(value);
        break;
      case 'origine':
        // Map origine to section for backend
        const sectionValue = mapOrigineToSection(value);
        if (sectionValue) {
          backendFilters.section = sectionValue;
        }
        break;
      default:
        backendFilters[key] = value;
    }
  });
  
  return backendFilters;
};

// Convert frontend sort to backend format - backend only supports criticality sorting
const mapSortToBackend = (sort: { field: string; direction: 'asc' | 'desc' } | null): 'LOW' | 'HIGH' => {
  // Backend API parameter is called 'filter' and only supports LOW/HIGH for criticality
  if (!sort || sort.field !== 'criticite') {
    return 'HIGH'; // Default to HIGH criticality first (descending order)
  }
  
  // Backend only supports sorting by criticality (LOW/HIGH)
  return sort.direction === 'desc' ? 'HIGH' : 'LOW';
};

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
    cell: ({ row }) => {
      const isFakeRow = row.original && typeof row.original === 'object' && '__isFakeRow' in row.original;
      
      if (isFakeRow) {
        return (
          <div className="font-mono text-sm font-medium text-zinc-400 whitespace-nowrap">
            -
          </div>
        );
      }
      
      const value = row.original.num_equipments;
      
      return (
        <div className="font-mono text-sm font-medium text-zinc-900 whitespace-nowrap truncate max-w-[100px]" title={value || ""}>
          {value || "-"}
        </div>
      );
    },
    size: 120,
    enableSorting: false, // Backend doesn't support sorting by this field
    enableHiding: false, // Always visible
  },
  {
    id: "systeme",
    header: "System",
    accessorKey: "systeme",
    cell: ({ row }) => {
      const isFakeRow = row.original && typeof row.original === 'object' && '__isFakeRow' in row.original;
      
      if (isFakeRow) {
        return (
          <div className="text-zinc-400 whitespace-nowrap">
            -
          </div>
        );
      }
      
      const value = row.original.systeme;
      
      return (
        <div className="font-medium text-zinc-900 whitespace-nowrap truncate max-w-[180px]" title={value || ""}>
          {value || "-"}
        </div>
      );
    },
    size: 200,
    enableSorting: false, // Backend doesn't support sorting by this field
    enableHiding: false, // Always visible
  },
  {
    id: "descreption_anomalie",
    header: "Description",
    accessorKey: "descreption_anomalie",
    cell: ({ row }) => {
      const isFakeRow = row.original && typeof row.original === 'object' && '__isFakeRow' in row.original;
      
      if (isFakeRow) {
        return (
          <div className="text-zinc-400 whitespace-nowrap">
            -
          </div>
        );
      }
      
      const value = row.original.descreption_anomalie;
      
      return (
        <div className="text-sm text-zinc-600 whitespace-nowrap truncate max-w-[280px]" title={value || ""}>
          {value || "-"}
        </div>
      );
    },
    size: 300,
    enableSorting: false,
    enableHiding: false, // Always visible
  },
  {
    id: "process_safty",
    header: "Process Safety",
    accessorKey: "process_safty",
    cell: ({ row }) => {
      const isFakeRow = row.original && typeof row.original === 'object' && '__isFakeRow' in row.original;
      
      if (isFakeRow) {
        return (
          <div className="text-zinc-400 whitespace-nowrap">
            -
          </div>
        );
      }
      
      const value = row.original.process_safty;
      
      return (
        <div className="flex items-center whitespace-nowrap">
          <div 
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: value ? getRedOpacity(value) : 'transparent' }}
          >
            <span className="text-sm font-medium text-zinc-900">
              {value || "-"}
            </span>
          </div>
        </div>
      );
    },
    size: 120,
    enableSorting: false, // Backend doesn't support sorting by this field
    enableHiding: false, // Always visible
  },
  {
    id: "fiablite_integrite",
    header: "Reliability",
    accessorKey: "fiablite_integrite",
    cell: ({ row }) => {
      const isFakeRow = row.original && typeof row.original === 'object' && '__isFakeRow' in row.original;
      
      if (isFakeRow) {
        return (
          <div className="text-zinc-400 whitespace-nowrap">
            -
          </div>
        );
      }
      
      const value = row.original.fiablite_integrite;
      
      return (
        <div className="flex items-center whitespace-nowrap">
          <div 
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: value ? getRedOpacity(value) : 'transparent' }}
          >
            <span className="text-sm font-medium text-zinc-900">
              {value || "-"}
            </span>
          </div>
        </div>
      );
    },
    size: 120,
    enableSorting: false, // Backend doesn't support sorting by this field
    enableHiding: false, // Always visible
  },
  {
    id: "disponsibilite",
    header: "Availability",
    accessorKey: "disponsibilite",
    cell: ({ row }) => {
      const isFakeRow = row.original && typeof row.original === 'object' && '__isFakeRow' in row.original;
      
      if (isFakeRow) {
        return (
          <div className="text-zinc-400 whitespace-nowrap">
            -
          </div>
        );
      }
      
      const value = row.original.disponsibilite;
      
      return (
        <div className="flex items-center whitespace-nowrap">
          <div 
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: value ? getRedOpacity(value) : 'transparent' }}
          >
            <span className="text-sm font-medium text-zinc-900">
              {value || "-"}
            </span>
          </div>
        </div>
      );
    },
    size: 120,
    enableSorting: false, // Backend doesn't support sorting by this field
    enableHiding: false, // Always visible
  },
  {
    id: "criticite",
    header: "Criticality",
    accessorKey: "criticite",
    cell: ({ row }) => {
      // Check if this is a fake row (padding row)
      const isFakeRow = row.original && typeof row.original === 'object' && '__isFakeRow' in row.original;
      
      if (isFakeRow) {
        return (
          <div className="flex items-center whitespace-nowrap">
            <span className="text-zinc-400">-</span>
          </div>
        );
      }
      
      const value = row.original.criticite;
      
      if (!value) {
        return (
          <div className="flex items-center whitespace-nowrap">
            <span className="text-zinc-400">-</span>
          </div>
        );
      }
      
      return (
        <div className="flex items-center whitespace-nowrap">
          <AnomalyCriticalityIndicator 
            criticality={parseFloat(value) || 0}
            variant="badge"
          />
        </div>
      );
    },
    size: 140,
    enableSorting: true, // Only this field supports backend sorting
    enableHiding: false, // Always visible
  },
  {
    id: "status",
    header: "Status",
    accessorKey: "status",
    cell: ({ row }) => {
      const isFakeRow = row.original && typeof row.original === 'object' && '__isFakeRow' in row.original;
      
      if (isFakeRow) {
        return (
          <div className="text-zinc-400 whitespace-nowrap">
            -
          </div>
        );
      }
      
      const value = row.original.status;
      
      if (!value) {
        return (
          <div className="text-zinc-400 whitespace-nowrap">
            -
          </div>
        );
      }
      
      return (
        <div className="whitespace-nowrap">
          <AnomalyStatusComponent 
            status={value}
          />
        </div>
      );
    },
    size: 150,
    enableSorting: false, // Backend doesn't support sorting by this field
    enableHiding: false, // Always visible
  },
  {
    id: "date_detection",
    header: "Date Detected",
    accessorKey: "date_detection",
    cell: ({ row }) => {
      const isFakeRow = row.original && typeof row.original === 'object' && '__isFakeRow' in row.original;
      
      if (isFakeRow) {
        return (
          <div className="text-zinc-400 whitespace-nowrap">
            -
          </div>
        );
      }
      
      const value = row.original.date_detection;
      
      return (
        <div className="text-sm text-zinc-600 whitespace-nowrap">
          {value ? new Date(value).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          }) : "-"}
        </div>
      );
    },
    size: 120,
    enableSorting: false, // Backend doesn't support sorting by this field
    enableHiding: true, // Can be hidden
  },
  {
    id: "origine",
    header: "Origin",
    accessorKey: "origine",
    cell: ({ row }) => {
      const isFakeRow = row.original && typeof row.original === 'object' && '__isFakeRow' in row.original;
      
      if (isFakeRow) {
        return (
          <div className="text-zinc-400 whitespace-nowrap">
            -
          </div>
        );
      }
      
      const value = row.original.origine;
      
      return (
        <div className="text-sm text-zinc-600 whitespace-nowrap truncate max-w-[130px]" title={value || ""}>
          {value || "-"}
        </div>
      );
    },
    size: 150,
    enableSorting: false, // Backend doesn't support sorting by this field
    enableHiding: true, // Can be hidden
  },

  {
    id: "criticality_indicator",
    header: "",
    cell: ({ row }) => {
      const isFakeRow = row.original && typeof row.original === 'object' && '__isFakeRow' in row.original;
      
      if (isFakeRow) {
        return (
          <div className="flex items-center justify-end whitespace-nowrap">
            <div 
              className="w-1 h-8 rounded-full bg-zinc-400 flex-shrink-0"
              title="Empty row"
            />
          </div>
        );
      }
      
      return (
        <div className="flex items-center justify-end whitespace-nowrap">
          <div 
            className={`w-1 h-8 rounded-full flex-shrink-0 ${getCriticalityIndicatorColor(row.original.criticite)}`}
            title={getCriticalityLevel(row.original.criticite)}
          />
        </div>
      );
    },
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
          field: "criticite",
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
            criticite: true,
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
  
  // Server-side state management
  const [currentPage, setCurrentPage] = useState(1);
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const [sort, setSort] = useState<{ field: string; direction: 'asc' | 'desc' } | null>({
    field: 'criticite',
    direction: 'desc' // Start with highest criticality first
  });
  const [searchTerm, setSearchTerm] = useState("");

  // Map frontend filters and sort to backend format
  const backendFilters = mapFiltersToBackend(activeFilters);
  const backendSort = mapSortToBackend(sort);

  // Fetch anomalies with server-side parameters
  const { data, isLoading, error } = useAnomalies({
    page: currentPage,
    limit: 10,
    status: backendFilters.status,
    criticity: backendFilters.criticity,
    section: backendFilters.section,
    orderBy: backendSort, // This maps to the 'filter' parameter in backend API
  });

  const anomalies = data?.anomalies || [];

  // Add computed criticality filter field to the data for client-side display
  const processedAnomalies = useMemo(() => {
    return anomalies.map((anomaly: Anomaly) => ({
      ...anomaly,
      criticality_filter: getCriticalityFilterValue(anomaly.criticite)
    }));
  }, [anomalies]);

  // Server-side configuration for DataTable
  const serverSideConfig: ServerSideConfig = {
    enabled: true,
    currentFilters: activeFilters,
    currentSort: sort,
    onFiltersChange: (newFilters: Record<string, string>) => {
      setActiveFilters(newFilters);
      setCurrentPage(1); // Reset to first page when filters change
    },
    onSortChange: (newSort: { field: string; direction: 'asc' | 'desc' } | null) => {
      // Only allow sorting by criticality since backend doesn't support other fields
      if (newSort && newSort.field !== 'criticite') {
        // For other fields, show a message or ignore (for now, ignore)
        return;
      }
      setSort(newSort);
      setCurrentPage(1); // Reset to first page when sort changes
    },
    onSearchChange: (search: string) => {
      setSearchTerm(search);
      setCurrentPage(1); // Reset to first page when search changes
      // Note: Search is not implemented in backend yet, this is for future use
    },
  };

  const handlePageChange = (page: number) => {
    // Validate page number before setting
    const maxPages = data?.totalPages || 1;
    const validPage = Math.min(Math.max(1, page), Math.max(1, maxPages));
    setCurrentPage(validPage);
  };

  // Auto-correct current page when total pages change
  useEffect(() => {
    const totalPages = data?.totalPages || 1;
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(Math.max(1, totalPages));
    }
  }, [data?.totalPages, currentPage]);

  return (
    <div className="px-6 py-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">Anomaly Management</h1>
          <p className="text-zinc-600 mt-1">Monitor equipment anomalies with detailed criticality assessment</p>
        </div>
        <div className="flex gap-3">
        <Button 
            onClick={() => router.push("/dashboard/anomalies/new")}
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 border-0"
          >
            <Plus className="w-4 h-4" />
            Add Anomalies
          </Button>
        </div>
      </div>

      {/* Data Table with server-side operations */}
      <div className="overflow-hidden">
        <DataTable
          data={processedAnomalies}
          columns={columns}
          config={config}
          filters={filters}
          loading={isLoading}
          error={error ? new Error(error?.message || 'Failed to load anomalies') : null}
          onRowClick={(anomaly) => router.push(`/dashboard/anomalies/detail?id=${anomaly.id}`)}
          className="w-full"
          pagination={{
            currentPage: currentPage, // Use local state instead of backend data
            totalPages: data?.totalPages || 1,
            total: data?.total || 0,
            onPageChange: handlePageChange,
          }}
          serverSide={serverSideConfig}
        />
      </div>
    </div>
  );
}