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
];

const criticiteColors = {
  LOW: "bg-green-100 text-green-800",
  MEDIUM: "bg-yellow-100 text-yellow-800",
  HIGH: "bg-orange-100 text-orange-800",
  CRITICAL: "bg-red-100 text-red-800",
};

const statusColors = {
  OPEN: "bg-blue-100 text-blue-800",
  IN_PROGRESS: "bg-purple-100 text-purple-800",
  RESOLVED: "bg-green-100 text-green-800",
  CLOSED: "bg-gray-100 text-gray-800",
};

export default function AnomaliesPage() {
  const t = useTranslations("sidebar.pages");
  const router = useRouter();

  // Define columns for the DataTable
  const columns: Column<AnomalyDisplay>[] = [
    {
      header: "ID",
      accessor: "id",
      width: "100px",
      clickable: true,
      render: (value) => (
        <span className="font-mono text-sm font-medium">{value}</span>
      ),
    },
    {
      header: "Equipment",
      accessor: "num_equipments",
      width: "120px",
      clickable: true,
      render: (value, anomaly) => (
        <div className="flex items-center gap-2">
          <Wrench className="h-4 w-4 text-muted-foreground" />
          <span className="font-mono text-sm">{value}</span>
        </div>
      ),
    },
    {
      header: "System",
      accessor: "systeme",
      width: "180px",
      clickable: true,
      hidden: true, // Hidden on mobile
    },
    {
      header: "Description",
      accessor: "descreption_anomalie",
      width: "300px",
      clickable: true,
      render: (value) => (
        <div className="max-w-xs truncate" title={value || ""}>
          {value || "No description"}
        </div>
      ),
    },
    {
      header: "Unit",
      accessor: "unite",
      width: "150px",
      clickable: true,
      hidden: true, // Hidden on mobile
    },
    {
      header: "Criticality",
      accessor: "criticite_display",
      width: "120px",
      clickable: true,
      render: (value) => (
        <Badge className={criticiteColors[value as AnomalyCriticite]}>
          {value}
        </Badge>
      ),
    },
    {
      header: "Status",
      accessor: "status",
      width: "120px",
      clickable: true,
      render: (value) => (
        <Badge className={statusColors[value as AnomalyStatus]}>
          {value.replace("_", " ")}
        </Badge>
      ),
    },
    {
      header: "Detected",
      accessor: "date_detection",
      width: "120px",
      clickable: true,
      render: (value) => (
        <span className="text-sm text-muted-foreground">
          {(value as Date).toLocaleDateString()}
        </span>
      ),
    },
    {
      header: "Actions",
      accessor: "equipement_id",
      width: "120px",
      clickable: false,
      render: (value, anomaly) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/dashboard/anomalies/detail?id=${anomaly.id}`)}
            className="h-8 w-8 p-0"
          >
            <Eye className="h-4 w-4" />
            <span className="sr-only">View details</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/dashboard/anomalies/edit/${anomaly.id}`)}
            className="h-8 w-8 p-0"
          >
            <Edit className="h-4 w-4" />
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
    pageSize: 10,
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
      label: "Criticality",
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
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Anomaly Management</h1>
          <p className="text-gray-600 mt-1">Monitor and resolve equipment anomalies</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => router.push("/dashboard/anomalies/batch-upload")}
          >
            <FileText className="h-4 w-4 mr-2" />
            Batch Upload
          </Button>
          <Button 
            size="sm"
            onClick={() => router.push("/dashboard/anomalies/new")}
          >
            <Plus className="h-4 w-4 mr-2" />
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