"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Eye, Edit, AlertTriangle, FileText, Wrench } from "lucide-react";
import { DataTable } from "@/components/data-table";
import { Column, DataTableConfig } from "@/components/data-table/types";
import { useRouter } from "next/navigation";
import { AnomalyDisplay, AnomalyCriticite, AnomalyStatus } from "@/types/anomaly";

// Mock data based on the provided schema
const mockAnomalies: AnomalyDisplay[] = [
  {
    id: "ANM-001",
    num_equipments: "EQ-001",
    unite: "Production Unit A",
    systeme: "Pressure Control System",
    descreption_anomalie: "Irregular pressure readings detected in main pipeline",
    date_detection: new Date("2024-01-15T08:30:00Z"),
    origine: "Sensor Malfunction",
    section_proprietaire: "Production",
    fiablite_integrite: "High Impact",
    disponsibilite: "Reduced",
    process_safty: "Safety Risk",
    Criticite: "HIGH",
    status: "OPEN",
    criticite_display: "HIGH",
    equipement_id: "EQ-001",
    equipement: {
      id: "EQ-001",
      name: "Main Pressure Sensor",
      location: "Building A - Floor 2",
      tag_number: "PS-001",
      description: "Primary pressure monitoring sensor for production line"
    }
  },
  {
    id: "ANM-002", 
    num_equipments: "EQ-002",
    unite: "Production Unit B",
    systeme: "Temperature Control",
    descreption_anomalie: "Temperature fluctuations outside normal operating range",
    date_detection: new Date("2024-01-15T09:15:00Z"),
    origine: "Calibration Drift",
    section_proprietaire: "Maintenance",
    fiablite_integrite: "Medium Impact",
    disponsibilite: "Operational",
    process_safty: "Monitor",
    Criticite: "MEDIUM",
    status: "IN_PROGRESS",
    criticite_display: "MEDIUM",
    equipement_id: "EQ-002",
    equipement: {
      id: "EQ-002",
      name: "Temperature Controller",
      location: "Building B - Floor 1",
      tag_number: "TC-002",
      description: "Temperature control unit for production processes"
    }
  },
  {
    id: "ANM-003",
    num_equipments: "EQ-003",
    unite: "Production Unit C",
    systeme: "Vibration Monitoring",
    descreption_anomalie: "Excessive vibration levels detected in motor housing",
    date_detection: new Date("2024-01-14T14:22:00Z"),
    origine: "Mechanical Wear",
    section_proprietaire: "Engineering",
    fiablite_integrite: "Critical Impact",
    disponsibilite: "Shutdown Required",
    process_safty: "Immediate Action",
    Criticite: "CRITICAL",
    status: "RESOLVED",
    criticite_display: "CRITICAL",
    equipement_id: "EQ-003",
    equipement: {
      id: "EQ-003",
      name: "Production Motor",
      location: "Building C - Floor 3",
      tag_number: "MO-003",
      description: "Main production line motor assembly"
    }
  },
  {
    id: "ANM-004",
    num_equipments: "EQ-004",
    unite: "Production Unit A",
    systeme: "Flow Control System",
    descreption_anomalie: "Reduced flow rate in primary distribution line",
    date_detection: new Date("2024-01-16T07:45:00Z"),
    origine: "Valve Blockage",
    section_proprietaire: "Operations",
    fiablite_integrite: "Medium Impact",
    disponsibilite: "Operational",
    process_safty: "Monitor",
    Criticite: "MEDIUM",
    status: "OPEN",
    criticite_display: "MEDIUM",
    equipement_id: "EQ-004",
    equipement: {
      id: "EQ-004",
      name: "Flow Control Valve",
      location: "Building A - Floor 1",
      tag_number: "FV-004",
      description: "Primary flow control valve for distribution system"
    }
  },
  {
    id: "ANM-005",
    num_equipments: "EQ-005",
    unite: "Utilities",
    systeme: "Electrical System",
    descreption_anomalie: "Power fluctuations causing equipment instability",
    date_detection: new Date("2024-01-16T11:20:00Z"),
    origine: "Grid Instability",
    section_proprietaire: "Electrical",
    fiablite_integrite: "High Impact",
    disponsibilite: "Reduced",
    process_safty: "Safety Risk",
    Criticite: "HIGH",
    status: "IN_PROGRESS",
    criticite_display: "HIGH",
    equipement_id: "EQ-005",
    equipement: {
      id: "EQ-005",
      name: "Main Electrical Panel",
      location: "Electrical Room",
      tag_number: "EP-005",
      description: "Main electrical distribution panel"
    }
  },
  {
    id: "ANM-006",
    num_equipments: "EQ-006",
    unite: "Quality Control",
    systeme: "Measurement System",
    descreption_anomalie: "Calibration drift in precision measurement device",
    date_detection: new Date("2024-01-13T13:30:00Z"),
    origine: "Equipment Aging",
    section_proprietaire: "Quality",
    fiablite_integrite: "Low Impact",
    disponsibilite: "Operational",
    process_safty: "No Risk",
    Criticite: "LOW",
    status: "CLOSED",
    criticite_display: "LOW",
    equipement_id: "EQ-006",
    equipement: {
      id: "EQ-006",
      name: "Precision Scale",
      location: "QC Lab",
      tag_number: "SC-006",
      description: "High precision weighing scale for quality control"
    }
  },
  {
    id: "ANM-007",
    num_equipments: "EQ-007",
    unite: "Production Unit D",
    systeme: "Cooling System",
    descreption_anomalie: "Coolant temperature rising above optimal range",
    date_detection: new Date("2024-01-16T16:45:00Z"),
    origine: "Pump Efficiency Loss",
    section_proprietaire: "Maintenance",
    fiablite_integrite: "Medium Impact",
    disponsibilite: "Operational",
    process_safty: "Monitor",
    Criticite: "MEDIUM",
    status: "OPEN",
    criticite_display: "MEDIUM",
    equipement_id: "EQ-007",
    equipement: {
      id: "EQ-007",
      name: "Cooling Pump",
      location: "Building D - Basement",
      tag_number: "CP-007",
      description: "Primary cooling system circulation pump"
    }
  },
  {
    id: "ANM-008",
    num_equipments: "EQ-008",
    unite: "Safety Systems",
    systeme: "Fire Detection",
    descreption_anomalie: "Smoke detector showing intermittent false alarms",
    date_detection: new Date("2024-01-12T10:15:00Z"),
    origine: "Dust Accumulation",
    section_proprietaire: "Safety",
    fiablite_integrite: "Critical Impact",
    disponsibilite: "Operational",
    process_safty: "Immediate Action",
    Criticite: "CRITICAL",
    status: "IN_PROGRESS",
    criticite_display: "CRITICAL",
    equipement_id: "EQ-008",
    equipement: {
      id: "EQ-008",
      name: "Smoke Detector",
      location: "Building A - Corridor",
      tag_number: "SD-008",
      description: "Fire safety smoke detection sensor"
    }
  },
  {
    id: "ANM-009",
    num_equipments: "EQ-009",
    unite: "Production Unit B",
    systeme: "Electrical System",
    descreption_anomalie: "Belt misalignment causing product spillage",
    date_detection: new Date("2024-01-16T14:30:00Z"),
    origine: "Mechanical Wear",
    section_proprietaire: "Production",
    fiablite_integrite: "Medium Impact",
    disponsibilite: "Reduced",
    process_safty: "Safety Risk",
    Criticite: "HIGH",
    status: "OPEN",
    criticite_display: "HIGH",
    equipement_id: "EQ-009",
    equipement: {
      id: "EQ-009",
      name: "Conveyor Belt",
      location: "Building B - Floor 2",
      tag_number: "CB-009",
      description: "Main product conveyor system"
    }
  },
  {
    id: "ANM-010",
    num_equipments: "EQ-010",
    unite: "HVAC System",
    systeme: "Electrical System",
    descreption_anomalie: "Air filter showing high pressure differential",
    date_detection: new Date("2024-01-11T09:00:00Z"),
    origine: "Filter Saturation",
    section_proprietaire: "Facilities",
    fiablite_integrite: "Low Impact",
    disponsibilite: "Operational",
    process_safty: "No Risk",
    Criticite: "LOW",
    status: "RESOLVED",
    criticite_display: "LOW",
    equipement_id: "EQ-010",
    equipement: {
      id: "EQ-010",
      name: "HVAC Filter",
      location: "Roof - HVAC Unit 1",
      tag_number: "HF-010",
      description: "Primary air filtration system"
    }
  },
  {
    id: "ANM-011",
    num_equipments: "EQ-011",
    unite: "Production Unit C",
    systeme: "Hydraulic System",
    descreption_anomalie: "Hydraulic fluid leak detected in actuator assembly",
    date_detection: new Date("2024-01-16T12:10:00Z"),
    origine: "Seal Failure",
    section_proprietaire: "Maintenance",
    fiablite_integrite: "High Impact",
    disponsibilite: "Shutdown Required",
    process_safty: "Safety Risk",
    Criticite: "CRITICAL",
    status: "OPEN",
    criticite_display: "CRITICAL",
    equipement_id: "EQ-011",
    equipement: {
      id: "EQ-011",
      name: "Hydraulic Actuator",
      location: "Building C - Floor 1",
      tag_number: "HA-011",
      description: "Primary hydraulic actuator for press operation"
    }
  },
  {
    id: "ANM-012",
    num_equipments: "EQ-012",
    unite: "Water Treatment",
    systeme: "pH Control System",
    descreption_anomalie: "pH levels consistently outside acceptable range",
    date_detection: new Date("2024-01-15T15:25:00Z"),
    origine: "Chemical Dosing Error",
    section_proprietaire: "Operations",
    fiablite_integrite: "Medium Impact",
    disponsibilite: "Operational",
    process_safty: "Monitor",
    Criticite: "MEDIUM",
    status: "IN_PROGRESS",
    criticite_display: "MEDIUM",
    equipement_id: "EQ-012",
    equipement: {
      id: "EQ-012",
      name: "pH Meter",
      location: "Water Treatment Plant",
      tag_number: "PH-012",
      description: "Water treatment pH monitoring system"
    }
  },
  {
    id: "ANM-013",
    num_equipments: "EQ-013",
    unite: "Production Unit A",
    systeme: "Lubrication System",
    descreption_anomalie: "Oil pressure low in main lubrication circuit",
    date_detection: new Date("2024-01-14T11:50:00Z"),
    origine: "Pump Wear",
    section_proprietaire: "Maintenance",
    fiablite_integrite: "High Impact",
    disponsibilite: "Reduced",
    process_safty: "Safety Risk",
    Criticite: "HIGH",
    status: "RESOLVED",
    criticite_display: "HIGH",
    equipement_id: "EQ-013",
    equipement: {
      id: "EQ-013",
      name: "Oil Pump",
      location: "Building A - Basement",
      tag_number: "OP-013",
      description: "Main lubrication system oil pump"
    }
  },
  {
    id: "ANM-014",
    num_equipments: "EQ-014",
    unite: "Control Room",
    systeme: "Electrical System",
    descreption_anomalie: "Data logger showing communication timeouts",
    date_detection: new Date("2024-01-16T08:15:00Z"),
    origine: "Network Issues",
    section_proprietaire: "IT",
    fiablite_integrite: "Low Impact",
    disponsibilite: "Operational",
    process_safty: "No Risk",
    Criticite: "LOW",
    status: "OPEN",
    criticite_display: "LOW",
    equipement_id: "EQ-014",
    equipement: {
      id: "EQ-014",
      name: "Data Logger",
      location: "Control Room",
      tag_number: "DL-014",
      description: "Process data acquisition system"
    }
  },
  {
    id: "ANM-015",
    num_equipments: "EQ-015",
    unite: "Production Unit D",
    systeme: "Pneumatic System",
    descreption_anomalie: "Compressed air pressure drops during peak demand",
    date_detection: new Date("2024-01-13T16:40:00Z"),
    origine: "Compressor Capacity",
    section_proprietaire: "Engineering",
    fiablite_integrite: "Medium Impact",
    disponsibilite: "Operational",
    process_safty: "Monitor",
    Criticite: "MEDIUM",
    status: "CLOSED",
    criticite_display: "MEDIUM",
    equipement_id: "EQ-015",
    equipement: {
      id: "EQ-015",
      name: "Air Compressor",
      location: "Building D - Compressor Room",
      tag_number: "AC-015",
      description: "Main pneumatic system air compressor"
    }
  },
  {
    id: "ANM-016",
    num_equipments: "EQ-016",
    unite: "Waste Management",
    systeme: "Waste Conveyor",
    descreption_anomalie: "Waste conveyor motor overheating during operation",
    date_detection: new Date("2024-01-16T13:20:00Z"),
    origine: "Motor Overload",
    section_proprietaire: "Maintenance",
    fiablite_integrite: "High Impact",
    disponsibilite: "Reduced",
    process_safty: "Safety Risk",
    Criticite: "HIGH",
    status: "IN_PROGRESS",
    criticite_display: "HIGH",
    equipement_id: "EQ-016",
    equipement: {
      id: "EQ-016",
      name: "Waste Conveyor Motor",
      location: "Waste Processing Area",
      tag_number: "WM-016",
      description: "Waste material conveyor drive motor"
    }
  },
  {
    id: "ANM-017",
    num_equipments: "EQ-017",
    unite: "Laboratory",
    systeme: "Spectroscopy System",
    descreption_anomalie: "Spectroscope calibration drifting beyond tolerance",
    date_detection: new Date("2024-01-12T14:15:00Z"),
    origine: "Lamp Degradation",
    section_proprietaire: "Quality",
    fiablite_integrite: "Low Impact",
    disponsibilite: "Operational",
    process_safty: "No Risk",
    Criticite: "LOW",
    status: "RESOLVED",
    criticite_display: "LOW",
    equipement_id: "EQ-017",
    equipement: {
      id: "EQ-017",
      name: "Spectroscope",
      location: "Quality Lab",
      tag_number: "SP-017",
      description: "Material analysis spectroscopy equipment"
    }
  },
  {
    id: "ANM-018",
    num_equipments: "EQ-018",
    unite: "Production Unit B",
    systeme: "Steam System",
    descreption_anomalie: "Steam pressure fluctuations affecting process stability",
    date_detection: new Date("2024-01-15T10:30:00Z"),
    origine: "Valve Control Issues",
    section_proprietaire: "Operations",
    fiablite_integrite: "Critical Impact",
    disponsibilite: "Shutdown Required",
    process_safty: "Immediate Action",
    Criticite: "CRITICAL",
    status: "OPEN",
    criticite_display: "CRITICAL",
    equipement_id: "EQ-018",
    equipement: {
      id: "EQ-018",
      name: "Steam Control Valve",
      location: "Building B - Steam Header",
      tag_number: "SV-018",
      description: "Main steam pressure control valve"
    }
  },
  {
    id: "ANM-019",
    num_equipments: "EQ-019",
    unite: "Emergency Systems",
    systeme: "Emergency Lighting",
    descreption_anomalie: "Emergency lighting system battery backup failing",
    date_detection: new Date("2024-01-14T17:05:00Z"),
    origine: "Battery Degradation",
    section_proprietaire: "Safety",
    fiablite_integrite: "Critical Impact",
    disponsibilite: "Operational",
    process_safty: "Safety Risk",
    Criticite: "CRITICAL",
    status: "IN_PROGRESS",
    criticite_display: "CRITICAL",
    equipement_id: "EQ-019",
    equipement: {
      id: "EQ-019",
      name: "Emergency Light Battery",
      location: "Various Locations",
      tag_number: "EL-019",
      description: "Emergency lighting system backup battery"
    }
  },
  {
    id: "ANM-020",
    num_equipments: "EQ-020",
    unite: "Production Unit C",
    systeme: "Mixing System",
    descreption_anomalie: "Mixing tank agitator showing irregular rotation speed",
    date_detection: new Date("2024-01-16T09:45:00Z"),
    origine: "Gearbox Wear",
    section_proprietaire: "Production",
    fiablite_integrite: "Medium Impact",
    disponsibilite: "Operational",
    process_safty: "Monitor",
    Criticite: "MEDIUM",
    status: "OPEN",
    criticite_display: "MEDIUM",
    equipement_id: "EQ-020",
    equipement: {
      id: "EQ-020",
      name: "Mixing Tank Agitator",
      location: "Building C - Process Area",
      tag_number: "AG-020",
      description: "Main mixing tank agitator system"
    }
  }
];

// Traditional criticality colors - intuitive priority indicators
const criticalityDots = {
  LOW: "bg-green-500",
  MEDIUM: "bg-yellow-500", 
  HIGH: "bg-orange-500",
  CRITICAL: "bg-red-500",
};

const statusColors = {
  OPEN: "bg-zinc-50 text-zinc-600 border-zinc-200",
  IN_PROGRESS: "bg-zinc-100 text-zinc-700 border-zinc-300",
  RESOLVED: "bg-blue-600 text-white border-blue-600",
  CLOSED: "bg-zinc-50 text-zinc-500 border-zinc-200",
};

export default function AnomaliesPage() {
  const t = useTranslations("sidebar.pages");
  const router = useRouter();

  // Define columns for the DataTable
  const columns: Column<AnomalyDisplay>[] = [
    {
      header: "ID",
      accessor: "id",
      width: "auto",
      clickable: true,
      render: (value) => (
        <span className="font-mono text-xs font-medium text-zinc-800">{value as string}</span>
      ),
    },
    {
      header: "Equipment",
      accessor: "num_equipments",
      width: "auto",
      clickable: true,
      render: (value, anomaly) => (
        <div className="flex items-center gap-1.5">
          <Wrench className="h-3.5 w-3.5 text-zinc-500" />
          <span className="font-mono text-xs text-zinc-800">{value as string}</span>
        </div>
      ),
    },
    {
      header: "System",
      accessor: "systeme",
      width: "auto",
      clickable: true,
      render: (value) => (
        <span className="text-xs text-zinc-700 truncate block" title={value as string}>
          {value as string}
        </span>
      ),
    },
    {
      header: "Description",
      accessor: "descreption_anomalie",
      width: "auto",
      clickable: true,
      render: (value) => (
        <div className="max-w-[180px] truncate text-xs text-zinc-700" title={(value as string) || ""}>
          {(value as string) || "No description"}
        </div>
      ),
    },
    {
      header: "Unit",
      accessor: "unite",
      width: "auto",
      clickable: true,
      hidden: true, // Hidden on mobile
      render: (value) => (
        <span className="text-xs text-zinc-700">{value as string}</span>
      ),
    },
    {
      header: "Priority",
      accessor: "criticite_display",
      width: "auto",
      clickable: true,
      render: (value) => (
        <div className="flex items-center justify-center">
          <div 
            className={`w-3 h-3 rounded-full ${criticalityDots[value as AnomalyCriticite]} shadow-sm`}
            title={`${value} priority`}
          />
        </div>
      ),
    },
    {
      header: "Status",
      accessor: "status",
      width: "auto",
      clickable: true,
      render: (value) => (
        <Badge variant="outline" className={`${statusColors[value as AnomalyStatus]} text-xs px-2 py-0.5`}>
          {(value as string)?.replace("_", " ")}
        </Badge>
      ),
    },
    {
      header: "Detected",
      accessor: "date_detection",
      width: "auto",
      clickable: true,
      render: (value) => (
        <span className="text-xs text-zinc-500">
          {(value as Date).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
          })}
        </span>
      ),
    },
    {
      header: "Actions",
      accessor: "equipement_id",
      width: "auto",
      clickable: false,
      render: (value, anomaly) => (
        <div className="flex justify-end items-center gap-0.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/dashboard/anomalies/detail?id=${anomaly.id}`)}
            className="h-7 w-7 p-0 text-zinc-500 hover:text-zinc-700 hover:bg-zinc-100"
          >
            <Eye className="h-3.5 w-3.5" />
            <span className="sr-only">View details</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/dashboard/anomalies/detail?id=${anomaly.id}`)}
            className="h-7 w-7 p-0 text-zinc-500 hover:text-zinc-700 hover:bg-zinc-100"
          >
            <Edit className="h-3.5 w-3.5" />
            <span className="sr-only">Edit anomaly</span>
          </Button>
        </div>
      ),
    },
  ];

  // Configure the DataTable
  const config: DataTableConfig<AnomalyDisplay> = {
    searchable: true,
    sortable: true,
    filterable: true,
    paginated: true,
    pageSize: 12,
    searchFields: ["id", "num_equipments", "systeme", "descreption_anomalie", "unite"],
    defaultSort: {
      field: "date_detection",
      direction: "desc",
    },
  };

  // Define filters
  const filters = [
    {
      key: "criticite_display",
      label: "Priority",
      options: [
        { value: "CRITICAL", label: "Critical" },
        { value: "HIGH", label: "High" },
        { value: "MEDIUM", label: "Medium" },
        { value: "LOW", label: "Low" },
      ],
    },
    {
      key: "status",
      label: "Status",
      options: [
        { value: "OPEN", label: "Open" },
        { value: "IN_PROGRESS", label: "In Progress" },
        { value: "RESOLVED", label: "Resolved" },
        { value: "CLOSED", label: "Closed" },
      ],
    },
    {
      key: "section_proprietaire",
      label: "Section",
      options: [
        { value: "Production", label: "Production" },
        { value: "Maintenance", label: "Maintenance" },
        { value: "Engineering", label: "Engineering" },
        { value: "Quality", label: "Quality" },
      ],
    },
  ];

  return (
    <div className="container mx-auto px-6 py-6 max-w-7xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">Anomaly Management</h1>
          <p className="text-zinc-600 mt-1">Monitor and resolve equipment anomalies</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => router.push("/dashboard/anomalies/batch-upload")}
            className="text-zinc-600 border-zinc-200 hover:bg-zinc-50 hover:border-zinc-300"
          >
            <FileText className="h-4 w-4 mr-1.5" />
            Batch Upload
          </Button>
          <Button 
            size="sm"
            onClick={() => router.push("/dashboard/anomalies/new")}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            New Anomaly
          </Button>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        data={mockAnomalies}
        columns={columns}
        config={config}
        filters={filters}
        onRowClick={(anomaly) => router.push(`/dashboard/anomalies/detail?id=${anomaly.id}`)}
        className="w-full"
      />
    </div>
  );
} 