import { DataTable, Column, DataTableConfig } from "../index";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Edit, Trash2, AlertTriangle } from "lucide-react";

// Example anomaly data type based on the TAQATHON project
interface Anomaly {
  id: number;
  title: string;
  description: string;
  severity: "low" | "medium" | "high" | "critical";
  status: "pending" | "investigating" | "resolved" | "closed";
  createdAt: Date;
  updatedAt: Date;
  assignedTo?: string;
  category: string;
}

// Sample anomaly data
const sampleAnomalies: Anomaly[] = [
  {
    id: 1,
    title: "Unusual Network Traffic",
    description: "Detected abnormal network traffic patterns",
    severity: "high",
    status: "investigating",
    createdAt: new Date("2024-01-15T10:30:00"),
    updatedAt: new Date("2024-01-15T14:20:00"),
    assignedTo: "John Doe",
    category: "Network Security",
  },
  {
    id: 2,
    title: "Failed Login Attempts",
    description: "Multiple failed login attempts detected",
    severity: "medium",
    status: "pending",
    createdAt: new Date("2024-01-14T09:15:00"),
    updatedAt: new Date("2024-01-14T09:15:00"),
    category: "Authentication",
  },
  {
    id: 3,
    title: "Resource Utilization Spike",
    description: "CPU usage exceeded normal thresholds",
    severity: "low",
    status: "resolved",
    createdAt: new Date("2024-01-13T16:45:00"),
    updatedAt: new Date("2024-01-13T18:30:00"),
    assignedTo: "Jane Smith",
    category: "Performance",
  },
  {
    id: 4,
    title: "Data Integrity Issue",
    description: "Potential data corruption detected",
    severity: "critical",
    status: "investigating",
    createdAt: new Date("2024-01-12T11:20:00"),
    updatedAt: new Date("2024-01-12T13:10:00"),
    assignedTo: "Mike Johnson",
    category: "Data Management",
  },
];

/**
 * AnomalyDataTable - Example data table for anomaly management
 * 
 * This demonstrates how to use the DataTable component with:
 * - Custom renderers for status badges and severity indicators
 * - Action buttons for viewing, editing, and deleting anomalies
 * - Filtering by severity and status
 * - Search functionality across multiple fields
 * - Responsive design with hidden columns on mobile
 */
export function AnomalyDataTable() {
  // Define columns with custom renderers
  const columns: Column<Anomaly>[] = [
    {
      header: "ID",
      accessor: "id",
      width: "80px",
      clickable: true,
      render: (value) => (
        <span className="font-mono text-sm">#{value}</span>
      ),
    },
    {
      header: "Title",
      accessor: "title",
      width: "250px",
      clickable: true,
      render: (value, anomaly) => (
        <div className="flex items-center gap-2">
          <AlertTriangle 
            className={`h-4 w-4 ${
              anomaly.severity === "critical" ? "text-red-500" :
              anomaly.severity === "high" ? "text-orange-500" :
              anomaly.severity === "medium" ? "text-yellow-500" : "text-blue-500"
            }`}
          />
          <span className="font-medium">{value}</span>
        </div>
      ),
    },
    {
      header: "Category",
      accessor: "category",
      width: "150px",
      clickable: true,
      hidden: true, // Hidden on mobile
      render: (value) => (
        <Badge variant="outline">{value}</Badge>
      ),
    },
    {
      header: "Severity",
      accessor: "severity",
      width: "120px",
      clickable: true,
      render: (value) => (
        <Badge
          variant={
            value === "critical" ? "destructive" :
            value === "high" ? "destructive" :
            value === "medium" ? "default" : "secondary"
          }
        >
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </Badge>
      ),
    },
    {
      header: "Status",
      accessor: "status",
      width: "120px",
      clickable: true,
      render: (value) => (
        <Badge
          variant={
            value === "resolved" ? "default" :
            value === "investigating" ? "default" :
            value === "pending" ? "secondary" : "outline"
          }
        >
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </Badge>
      ),
    },
    {
      header: "Assigned To",
      accessor: "assignedTo",
      width: "150px",
      clickable: true,
      hidden: true, // Hidden on mobile
      render: (value) => (
        <span className="text-muted-foreground">
          {value || "Unassigned"}
        </span>
      ),
    },
    {
      header: "Created",
      accessor: "createdAt",
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
      accessor: "id",
      width: "150px",
      clickable: false,
      render: (value, anomaly) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => viewAnomaly(anomaly)}
            className="h-8 w-8 p-0"
          >
            <Eye className="h-4 w-4" />
            <span className="sr-only">View anomaly</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editAnomaly(anomaly)}
            className="h-8 w-8 p-0"
          >
            <Edit className="h-4 w-4" />
            <span className="sr-only">Edit anomaly</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => deleteAnomaly(anomaly)}
            className="h-8 w-8 p-0"
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Delete anomaly</span>
          </Button>
        </div>
      ),
    },
  ];

  // Configure the data table
  const config: DataTableConfig<Anomaly> = {
    searchable: true,
    sortable: true,
    filterable: true,
    paginated: true,
    pageSize: 10,
    searchFields: ["title", "description", "category", "assignedTo"],
    defaultSort: {
      field: "createdAt",
      direction: "desc", // Show newest first
    },
  };

  // Define filters
  const filters = [
    {
      key: "severity",
      label: "Severity",
      options: [
        { value: "critical", label: "Critical" },
        { value: "high", label: "High" },
        { value: "medium", label: "Medium" },
        { value: "low", label: "Low" },
      ],
    },
    {
      key: "status",
      label: "Status",
      options: [
        { value: "pending", label: "Pending" },
        { value: "investigating", label: "Investigating" },
        { value: "resolved", label: "Resolved" },
        { value: "closed", label: "Closed" },
      ],
    },
    {
      key: "category",
      label: "Category",
      options: [
        { value: "Network Security", label: "Network Security" },
        { value: "Authentication", label: "Authentication" },
        { value: "Performance", label: "Performance" },
        { value: "Data Management", label: "Data Management" },
      ],
    },
  ];

  // Action handlers
  const viewAnomaly = (anomaly: Anomaly) => {
    console.log("View anomaly:", anomaly);
    // Navigate to anomaly detail page
    // router.push(`/dashboard/anomalies/detail?id=${anomaly.id}`);
  };

  const editAnomaly = (anomaly: Anomaly) => {
    console.log("Edit anomaly:", anomaly);
    // Navigate to edit page or open modal
    // router.push(`/dashboard/anomalies/edit/${anomaly.id}`);
  };

  const deleteAnomaly = (anomaly: Anomaly) => {
    console.log("Delete anomaly:", anomaly);
    // Show confirmation dialog and delete
    // if (confirm("Are you sure you want to delete this anomaly?")) {
    //   deleteAnomalyMutation.mutate(anomaly.id);
    // }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Anomaly Management</h1>
          <p className="text-muted-foreground">
            Monitor and manage security anomalies in your system
          </p>
        </div>
        <Button onClick={() => console.log("Create new anomaly")}>
          <AlertTriangle className="h-4 w-4 mr-2" />
          New Anomaly
        </Button>
      </div>

      <DataTable
        data={sampleAnomalies}
        columns={columns}
        config={config}
        filters={filters}
        className="w-full"
      />
    </div>
  );
}

// Export types and data for reuse
export { sampleAnomalies, type Anomaly }; 