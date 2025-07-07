"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, AlertTriangle, FileText, Wrench } from "lucide-react";
import { DataTable } from "@/components/data-table";
import { Column, DataTableConfig } from "@/components/data-table/types";
import { useRouter } from "next/navigation";
import { Anomaly, AnomalyStatus, calculateCriticality, getCriticalityLevel } from "@/types/anomaly";
import { AnomalyStatus as AnomalyStatusComponent, AnomalyCriticalityIndicator } from "@/components/anomaly";

// Helper function to get criticality filter value
const getCriticalityFilterValue = (criticality: number): string => {
  if (criticality >= 13) return 'critical';
  if (criticality >= 10) return 'high';
  if (criticality >= 7) return 'medium';
  return 'low';
};

// Mock data using new interface structure with 1-5 scale factors and 1-15 criticality
const mockAnomalies: Anomaly[] = [
  {
    id: "ANM-001",
    code: "ANM-001",
    equipment: "Main Pressure Sensor (PS-001)",
    description: "Irregular pressure readings detected in main pipeline",
    date_apparition: "2024-01-15T08:30:00Z",
    process_safety: 3,
    fiabilite_integrite: 3,
    disponibilite: 3,
    criticality: 10,
    origin: "Oracle",
    status: "New",
    created_at: "2024-01-15T08:30:00Z",
    updated_at: "2024-01-15T08:30:00Z"
  },
  {
    id: "ANM-002",
    code: "ANM-002", 
    equipment: "Temperature Controller (TC-002)",
    description: "Temperature fluctuations outside normal operating range",
    date_apparition: "2024-01-15T09:15:00Z",
    process_safety: 2,
    fiabilite_integrite: 3,
    disponibilite: 3,
    criticality: 8,
    origin: "APM",
    status: "In Progress",
    feedback_at: "2024-01-15T10:00:00Z",
    created_at: "2024-01-15T09:15:00Z",
    updated_at: "2024-01-15T10:00:00Z"
  },
  {
    id: "ANM-003",
    code: "ANM-003",
    equipment: "Production Motor (MO-003)",
    description: "Excessive vibration levels detected in motor housing",
    date_apparition: "2024-01-14T14:22:00Z",
    process_safety: 5,
    fiabilite_integrite: 4,
    disponibilite: 5,
    criticality: 14,
    origin: "IBM Maximo",
    status: "In Progress",
    feedback_at: "2024-01-14T15:00:00Z",
    scheduling_ready_at: "2024-01-14T16:00:00Z",
    scheduled_at: "2024-01-14T17:00:00Z",
    created_at: "2024-01-14T14:22:00Z",
    updated_at: "2024-01-14T17:00:00Z"
  },
  {
    id: "ANM-004",
    code: "ANM-004",
    equipment: "Flow Control Valve (FV-004)",
    description: "Reduced flow rate in primary distribution line",
    date_apparition: "2024-01-16T07:45:00Z",
    process_safety: 2,
    fiabilite_integrite: 2,
    disponibilite: 3,
    criticality: 7,
    origin: "EMC",
    status: "New",
    created_at: "2024-01-16T07:45:00Z",
    updated_at: "2024-01-16T07:45:00Z"
  },
  {
    id: "ANM-005",
    code: "ANM-005",
    equipment: "Main Electrical Panel (EP-005)",
    description: "Power fluctuations causing equipment instability",
    date_apparition: "2024-01-16T11:20:00Z",
    process_safety: 4,
    fiabilite_integrite: 3,
    disponibilite: 4,
    criticality: 11,
    origin: "Oracle",
    status: "In Progress",
    feedback_at: "2024-01-16T12:00:00Z",
    created_at: "2024-01-16T11:20:00Z",
    updated_at: "2024-01-16T12:00:00Z"
  },
  {
    id: "ANM-006",
    code: "ANM-006",
    equipment: "Precision Scale (SC-006)",
    description: "Calibration drift in precision measurement device",
    date_apparition: "2024-01-13T13:30:00Z",
    process_safety: 1,
    fiabilite_integrite: 2,
    disponibilite: 2,
    criticality: 5,
    origin: "APM",
    status: "Closed",
    feedback_at: "2024-01-13T14:00:00Z",
    scheduling_ready_at: "2024-01-13T15:00:00Z",
    scheduled_at: "2024-01-13T16:00:00Z",
    resolved_at: "2024-01-13T18:00:00Z",
    closed_at: "2024-01-13T19:00:00Z",
    created_at: "2024-01-13T13:30:00Z",
    updated_at: "2024-01-13T19:00:00Z"
  },
  {
    id: "ANM-007",
    code: "ANM-007",
    equipment: "Cooling Pump (CP-007)",
    description: "Coolant temperature rising above optimal range",
    date_apparition: "2024-01-16T16:45:00Z",
    process_safety: 3,
    fiabilite_integrite: 2,
    disponibilite: 3,
    criticality: 8,
    origin: "IBM Maximo",
    status: "New",
    created_at: "2024-01-16T16:45:00Z",
    updated_at: "2024-01-16T16:45:00Z"
  },
  {
    id: "ANM-008",
    code: "ANM-008",
    equipment: "Smoke Detector (SD-008)",
    description: "Smoke detector showing intermittent false alarms",
    date_apparition: "2024-01-12T10:15:00Z",
    process_safety: 5,
    fiabilite_integrite: 4,
    disponibilite: 3,
    criticality: 12,
    origin: "EMC",
    status: "Closed",
    feedback_at: "2024-01-12T11:00:00Z",
    scheduling_ready_at: "2024-01-12T12:00:00Z",
    scheduled_at: "2024-01-12T13:00:00Z",
    resolved_at: "2024-01-12T15:00:00Z",
    created_at: "2024-01-12T10:15:00Z",
    updated_at: "2024-01-12T15:00:00Z"
  },
  {
    id: "ANM-009",
    code: "ANM-009",
    equipment: "Conveyor Belt (CB-009)",
    description: "Belt misalignment causing product spillage",
    date_apparition: "2024-01-16T14:30:00Z",
    process_safety: 3,
    fiabilite_integrite: 3,
    disponibilite: 2,
    criticality: 8,
    origin: "Oracle",
    status: "New",
    created_at: "2024-01-16T14:30:00Z",
    updated_at: "2024-01-16T14:30:00Z"
  },
  {
    id: "ANM-010",
    code: "ANM-010",
    equipment: "HVAC Filter (HF-010)",
    description: "Air filter showing high pressure differential",
    date_apparition: "2024-01-11T09:00:00Z",
    process_safety: 1,
    fiabilite_integrite: 1,
    disponibilite: 2,
    criticality: 4,
    origin: "APM",
    status: "Closed",
    feedback_at: "2024-01-11T10:00:00Z",
    scheduling_ready_at: "2024-01-11T11:00:00Z",
    scheduled_at: "2024-01-11T12:00:00Z",
    resolved_at: "2024-01-11T14:00:00Z",
    created_at: "2024-01-11T09:00:00Z",
    updated_at: "2024-01-11T14:00:00Z"
  },
  {
    id: "ANM-011",
    code: "ANM-011",
    equipment: "Hydraulic Actuator (HA-011)",
    description: "Hydraulic fluid leak detected in actuator assembly",
    date_apparition: "2024-01-17T12:10:00Z",
    process_safety: 5,
    fiabilite_integrite: 4,
    disponibilite: 4,
    criticality: 13,
    origin: "IBM Maximo",
    status: "New",
    created_at: "2024-01-17T12:10:00Z",
    updated_at: "2024-01-17T12:10:00Z"
  },
  {
    id: "ANM-012",
    code: "ANM-012",
    equipment: "pH Meter (PH-012)",
    description: "pH levels consistently outside acceptable range",
    date_apparition: "2024-01-17T15:25:00Z",
    process_safety: 2,
    fiabilite_integrite: 3,
    disponibilite: 3,
    criticality: 8,
    origin: "EMC",
    status: "In Progress",
    feedback_at: "2024-01-17T16:00:00Z",
    created_at: "2024-01-17T15:25:00Z",
    updated_at: "2024-01-17T16:00:00Z"
  },
  {
    id: "ANM-013",
    code: "ANM-013",
    equipment: "Oil Pump (OP-013)",
    description: "Oil pressure low in main lubrication circuit",
    date_apparition: "2024-01-18T11:50:00Z",
    process_safety: 1,
    fiabilite_integrite: 3,
    disponibilite: 3,
    criticality: 7,
    origin: "Oracle",
    status: "Closed",
    feedback_at: "2024-01-18T12:30:00Z",
    scheduling_ready_at: "2024-01-18T13:00:00Z",
    scheduled_at: "2024-01-18T14:00:00Z",
    resolved_at: "2024-01-18T16:00:00Z",
    created_at: "2024-01-18T11:50:00Z",
    updated_at: "2024-01-18T16:00:00Z"
  },
  {
    id: "ANM-014",
    code: "ANM-014",
    equipment: "Data Logger (DL-014)",
    description: "Data logger showing communication timeouts",
    date_apparition: "2024-01-18T08:15:00Z",
    process_safety: 1,
    fiabilite_integrite: 2,
    disponibilite: 2,
    criticality: 5,
    origin: "APM",
    status: "New",
    created_at: "2024-01-18T08:15:00Z",
    updated_at: "2024-01-18T08:15:00Z"
  },
  {
    id: "ANM-015",
    code: "ANM-015",
    equipment: "Air Compressor (AC-015)",
    description: "Compressed air pressure drops during peak demand",
    date_apparition: "2024-01-19T16:40:00Z",
    process_safety: 3,
    fiabilite_integrite: 3,
    disponibilite: 3,
    criticality: 9,
    origin: "IBM Maximo",
    status: "Closed",
    feedback_at: "2024-01-19T17:00:00Z",
    scheduling_ready_at: "2024-01-19T17:30:00Z",
    scheduled_at: "2024-01-19T18:00:00Z",
    resolved_at: "2024-01-19T20:00:00Z",
    closed_at: "2024-01-19T21:00:00Z",
    created_at: "2024-01-19T16:40:00Z",
    updated_at: "2024-01-19T21:00:00Z"
  },
  {
    id: "ANM-016",
    code: "ANM-016",
    equipment: "Waste Conveyor Motor (WM-016)",
    description: "Waste conveyor motor overheating during operation",
    date_apparition: "2024-01-20T13:20:00Z",
    process_safety: 4,
    fiabilite_integrite: 3,
    disponibilite: 2,
    criticality: 9,
    origin: "EMC",
    status: "In Progress",
    feedback_at: "2024-01-20T14:00:00Z",
    scheduling_ready_at: "2024-01-20T14:30:00Z",
    scheduled_at: "2024-01-20T15:00:00Z",
    created_at: "2024-01-20T13:20:00Z",
    updated_at: "2024-01-20T15:00:00Z"
  },
  {
    id: "ANM-017",
    code: "ANM-017",
    equipment: "Spectroscope (SP-017)",
    description: "Spectroscope calibration drifting beyond tolerance",
    date_apparition: "2024-01-20T14:15:00Z",
    process_safety: 1,
    fiabilite_integrite: 2,
    disponibilite: 2,
    criticality: 5,
    origin: "Oracle",
    status: "Closed",
    feedback_at: "2024-01-20T15:00:00Z",
    scheduling_ready_at: "2024-01-20T15:30:00Z",
    scheduled_at: "2024-01-20T16:00:00Z",
    resolved_at: "2024-01-20T18:00:00Z",
    created_at: "2024-01-20T14:15:00Z",
    updated_at: "2024-01-20T18:00:00Z"
  },
  {
    id: "ANM-018",
    code: "ANM-018",
    equipment: "Steam Control Valve (SV-018)",
    description: "Steam pressure fluctuations affecting process stability",
    date_apparition: "2024-01-21T10:30:00Z",
    process_safety: 5,
    fiabilite_integrite: 4,
    disponibilite: 4,
    criticality: 13,
    origin: "APM",
    status: "New",
    created_at: "2024-01-21T10:30:00Z",
    updated_at: "2024-01-21T10:30:00Z"
  },
  {
    id: "ANM-019",
    code: "ANM-019",
    equipment: "Emergency Light Battery (EL-019)",
    description: "Emergency lighting system battery backup failing",
    date_apparition: "2024-01-21T17:05:00Z",
    process_safety: 5,
    fiabilite_integrite: 3,
    disponibilite: 3,
    criticality: 11,
    origin: "IBM Maximo",
    status: "In Progress",
    feedback_at: "2024-01-21T17:30:00Z",
    created_at: "2024-01-21T17:05:00Z",
    updated_at: "2024-01-21T17:30:00Z"
  },
  {
    id: "ANM-020",
    code: "ANM-020",
    equipment: "Mixing Tank Agitator (AG-020)",
    description: "Mixing tank agitator showing irregular rotation speed",
    date_apparition: "2024-01-22T09:45:00Z",
    process_safety: 2,
    fiabilite_integrite: 3,
    disponibilite: 3,
    criticality: 8,
    origin: "EMC",
    status: "New",
    created_at: "2024-01-22T09:45:00Z",
    updated_at: "2024-01-22T09:45:00Z"
  },
  {
    id: "ANM-021",
    code: "ANM-021",
    equipment: "Cooling Tower Fan (CTF-021)",
    description: "Cooling tower fan vibration levels exceed normal limits",
    date_apparition: "2024-01-22T11:30:00Z",
    process_safety: 3,
    fiabilite_integrite: 4,
    disponibilite: 3,
    criticality: 10,
    origin: "Oracle",
    status: "In Progress",
    feedback_at: "2024-01-22T12:00:00Z",
    scheduling_ready_at: "2024-01-22T12:30:00Z",
    scheduled_at: "2024-01-22T13:00:00Z",
    created_at: "2024-01-22T11:30:00Z",
    updated_at: "2024-01-22T13:00:00Z"
  },
  {
    id: "ANM-022",
    code: "ANM-022",
    equipment: "Dosing Pump (DP-022)",
    description: "Chemical dosing pump flow rate inconsistent",
    date_apparition: "2024-01-23T08:20:00Z",
    process_safety: 3,
    fiabilite_integrite: 2,
    disponibilite: 3,
    criticality: 8,
    origin: "APM",
    status: "New",
    created_at: "2024-01-23T08:20:00Z",
    updated_at: "2024-01-23T08:20:00Z"
  },
  {
    id: "ANM-023",
    code: "ANM-023",
    equipment: "Safety Valve (SV-023)",
    description: "Safety valve pressure relief mechanism not responding",
    date_apparition: "2024-01-23T14:45:00Z",
    process_safety: 5,
    fiabilite_integrite: 5,
    disponibilite: 4,
    criticality: 14,
    origin: "IBM Maximo",
    status: "In Progress",
    feedback_at: "2024-01-23T15:00:00Z",
    created_at: "2024-01-23T14:45:00Z",
    updated_at: "2024-01-23T15:00:00Z"
  },
  {
    id: "ANM-024",
    code: "ANM-024",
    equipment: "Heat Exchanger (HE-024)",
    description: "Heat exchanger efficiency degraded below optimal range",
    date_apparition: "2024-01-24T07:15:00Z",
    process_safety: 2,
    fiabilite_integrite: 4,
    disponibilite: 3,
    criticality: 9,
    origin: "EMC",
    status: "Closed",
    feedback_at: "2024-01-24T08:00:00Z",
    scheduling_ready_at: "2024-01-24T08:30:00Z",
    scheduled_at: "2024-01-24T09:00:00Z",
    resolved_at: "2024-01-24T12:00:00Z",
    created_at: "2024-01-24T07:15:00Z",
    updated_at: "2024-01-24T12:00:00Z"
  },
  {
    id: "ANM-025",
    code: "ANM-025",
    equipment: "Control Panel Display (CPD-025)",
    description: "Control panel display showing intermittent errors",
    date_apparition: "2024-01-24T16:30:00Z",
    process_safety: 1,
    fiabilite_integrite: 2,
    disponibilite: 2,
    criticality: 5,
    origin: "Oracle",
    status: "New",
    created_at: "2024-01-24T16:30:00Z",
    updated_at: "2024-01-24T16:30:00Z"
  },
  {
    id: "ANM-026",
    code: "ANM-026",
    equipment: "Boiler Feed Pump (BFP-026)",
    description: "Boiler feed pump cavitation detected during startup",
    date_apparition: "2024-01-25T06:45:00Z",
    process_safety: 3,
    fiabilite_integrite: 4,
    disponibilite: 3,
    criticality: 11,
    origin: "APM",
    status: "In Progress",
    feedback_at: "2024-01-25T07:30:00Z",
    scheduling_ready_at: "2024-01-25T08:00:00Z",
    scheduled_at: "2024-01-25T08:30:00Z",
    created_at: "2024-01-25T06:45:00Z",
    updated_at: "2024-01-25T08:30:00Z"
  },
  {
    id: "ANM-027",
    code: "ANM-027",
    equipment: "Gas Analyzer (GA-027)",
    description: "Gas analyzer readings inconsistent with manual samples",
    date_apparition: "2024-01-25T13:10:00Z",
    process_safety: 3,
    fiabilite_integrite: 3,
    disponibilite: 2,
    criticality: 8,
    origin: "IBM Maximo",
    status: "Closed",
    feedback_at: "2024-01-25T14:00:00Z",
    scheduling_ready_at: "2024-01-25T14:30:00Z",
    scheduled_at: "2024-01-25T15:00:00Z",
    resolved_at: "2024-01-25T17:00:00Z",
    closed_at: "2024-01-25T17:30:00Z",
    created_at: "2024-01-25T13:10:00Z",
    updated_at: "2024-01-25T17:30:00Z"
  }
];

// Helper function to calculate red color opacity based on value (1-5 scale)
const getRedOpacity = (value: number): string => {
  // Only values 4 and 5 should be red (less colored), others transparent
  if (value === 4 || value === 5) {
    return 'rgba(239, 68, 68, 0.15)'; // 30% red for values 4 and 5 (less colored)
  }
  return 'transparent'; // values 1, 2, 3 stay transparent
};

// Helper function to get criticality indicator color
const getCriticalityIndicatorColor = (criticality: number): string => {
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
    id: "code",
    header: "Code",
    accessorKey: "code",
    cell: ({ row }) => (
      <div className="font-mono text-sm font-medium text-zinc-900">
        {row.original.code}
      </div>
    ),
    size: 100,
    enableSorting: true,
    enableHiding: false, // Always visible
  },
  {
    id: "equipment",
    header: "Equipment",
    accessorKey: "equipment",
    cell: ({ row }) => (
      <div className="max-w-[200px]">
        <div className="font-medium text-zinc-900 truncate" title={row.original.equipment}>
          {row.original.equipment}
        </div>
      </div>
    ),
    size: 200,
    enableSorting: true,
    enableHiding: false, // Always visible
  },
  {
    id: "description",
    header: "Description",
    accessorKey: "description",
    cell: ({ row }) => (
      <div className="max-w-[300px]">
        <div className="text-sm text-zinc-600 truncate" title={row.original.description}>
          {row.original.description}
        </div>
      </div>
    ),
    size: 300,
    enableSorting: false,
    enableHiding: false, // Always visible
  },
  {
    id: "process_safety",
    header: "Process Safety",
    accessorKey: "process_safety",
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <div 
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: getRedOpacity(row.original.process_safety) }}
        >
          <span className="text-sm font-medium text-zinc-900">
            {row.original.process_safety}
          </span>
        </div>
      </div>
    ),
    size: 120,
    enableSorting: true,
    enableHiding: false, // Always visible
  },
  {
    id: "fiabilite_integrite",
    header: "Reliability",
    accessorKey: "fiabilite_integrite",
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <div 
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: getRedOpacity(row.original.fiabilite_integrite) }}
        >
          <span className="text-sm font-medium text-zinc-900">
            {row.original.fiabilite_integrite}
          </span>
        </div>
      </div>
    ),
    size: 120,
    enableSorting: true,
    enableHiding: false, // Always visible
  },
  {
    id: "disponibilite",
    header: "Availability",
    accessorKey: "disponibilite",
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <div 
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: getRedOpacity(row.original.disponibilite) }}
        >
          <span className="text-sm font-medium text-zinc-900">
            {row.original.disponibilite}
          </span>
        </div>
      </div>
    ),
    size: 120,
    enableSorting: true,
    enableHiding: false, // Always visible
  },
  {
    id: "criticality",
    header: "Criticality",
    accessorKey: "criticality",
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
            criticality={row.original.criticality}
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
          status={row.original.status}
        />
      </div>
    ),
    size: 150,
    enableSorting: true,
    enableHiding: false, // Always visible
  },
  {
    id: "date_apparition",
    header: "Date Detected",
    accessorKey: "date_apparition",
    cell: ({ row }) => (
      <div className="text-sm text-zinc-600">
        {new Date(row.original.date_apparition).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        })}
      </div>
    ),
    size: 120,
    enableSorting: true,
    enableHiding: true, // Can be hidden
  },
  {
    id: "origin",
    header: "Origin",
    accessorKey: "origin",
    cell: ({ row }) => (
      <div className="text-sm text-zinc-600">
        {row.original.origin || "Unknown"}
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
          className={`w-1 h-8 rounded-full ${getCriticalityIndicatorColor(row.original.criticality)}`}
          title={getCriticalityLevel(row.original.criticality)}
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
  searchableColumns: ["code", "equipment", "description", "origin"],
  // Default sorting: Critical anomalies first (highest criticality first)
  defaultSort: {
    field: "criticality",
    direction: "desc", // Descending order (highest criticality first)
  },
  // Default visible columns (most important ones in new order)
  defaultColumnVisibility: {
    code: true,
    equipment: true,
    description: true,
    process_safety: true, // Now visible by default
    fiabilite_integrite: true, // Now visible by default
    disponibilite: true, // Now visible by default
    criticality: true,
    status: true,
    date_apparition: false, // Hidden by default
    origin: false, // Hidden by default
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
    key: "origin",
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

  // Add computed criticality filter field to the data
  const processedAnomalies = useMemo(() => {
    return mockAnomalies.map(anomaly => ({
      ...anomaly,
      criticality_filter: getCriticalityFilterValue(anomaly.criticality)
    }));
  }, []);

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