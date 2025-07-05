import { DataTable } from "../DataTable";
import { Column, DataTableConfig } from "../types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Edit, Trash2 } from "lucide-react";

// Example data type
interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: "active" | "inactive" | "pending";
  createdAt: Date;
}

// Example data
const sampleUsers: User[] = [
  {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    role: "Admin",
    status: "active",
    createdAt: new Date("2023-01-15"),
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane@example.com",
    role: "User",
    status: "inactive",
    createdAt: new Date("2023-02-20"),
  },
  // Add more sample data as needed
];

/**
 * BasicDataTable - Template component showing how to use the DataTable
 * 
 * This is a copy-paste friendly template that demonstrates:
 * - Column configuration with custom renderers
 * - Data table configuration
 * - Filter setup
 * - Action buttons
 */
export function BasicDataTable() {
  // Define columns with custom renderers
  const columns: Column<User>[] = [
    {
      header: "Name",
      accessor: "name",
      width: "200px",
      clickable: true,
    },
    {
      header: "Email",
      accessor: "email",
      width: "250px",
      clickable: true,
    },
    {
      header: "Role",
      accessor: "role",
      width: "120px",
      clickable: true,
      render: (value) => (
        <Badge variant={value === "Admin" ? "default" : "secondary"}>
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
        <Badge
          variant={
            value === "active" ? "default" : 
            value === "inactive" ? "destructive" : "secondary"
          }
        >
          {value}
        </Badge>
      ),
    },
    {
      header: "Created",
      accessor: "createdAt",
      width: "150px",
      clickable: true,
      render: (value) => (
        <span className="text-muted-foreground">
          {(value as Date).toLocaleDateString()}
        </span>
      ),
    },
    {
      header: "Actions",
      accessor: "id",
      width: "150px",
      clickable: false,
      render: (value, user) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => console.log("View", user)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => console.log("Edit", user)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => console.log("Delete", user)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  // Configure the data table
  const config: DataTableConfig<User> = {
    searchable: true,
    sortable: true,
    filterable: true,
    paginated: true,
    pageSize: 10,
    searchFields: ["name", "email"], // Only search in these fields
    defaultSort: {
      field: "name",
      direction: "asc",
    },
  };

  // Define filters
  const filters = [
    {
      key: "role",
      label: "Role",
      options: [
        { value: "Admin", label: "Admin" },
        { value: "User", label: "User" },
      ],
    },
    {
      key: "status",
      label: "Status",
      options: [
        { value: "active", label: "Active" },
        { value: "inactive", label: "Inactive" },
        { value: "pending", label: "Pending" },
      ],
    },
  ];

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Users</h1>
        <p className="text-muted-foreground">
          Manage your users with search, filtering, and sorting
        </p>
      </div>

      <DataTable
        data={sampleUsers}
        columns={columns}
        config={config}
        filters={filters}
        className="w-full"
      />
    </div>
  );
}

// Export for easy copy-paste
export { sampleUsers, type User }; 