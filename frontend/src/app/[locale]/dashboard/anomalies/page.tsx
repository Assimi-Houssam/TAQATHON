"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Filter, Search, AlertTriangle, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useState } from "react";

// Mock data for demonstration
const mockAnomalies = [
  {
    id: "ANM-001",
    title: "Temperature Sensor Malfunction",
    description: "Temperature sensor in Unit A shows irregular readings",
    severity: "HIGH",
    status: "OPEN",
    detectedAt: "2024-01-15T08:30:00Z",
    unit: "Production Unit A",
    category: "SENSOR_FAILURE",
  },
  {
    id: "ANM-002",
    title: "Pressure Variance Detected",
    description: "Pressure readings outside normal parameters",
    severity: "MEDIUM",
    status: "IN_PROGRESS",
    detectedAt: "2024-01-15T09:15:00Z",
    unit: "Production Unit B",
    category: "PRESSURE_ANOMALY",
  },
  {
    id: "ANM-003",
    title: "Vibration Level Exceeded",
    description: "Motor vibration levels above safety threshold",
    severity: "CRITICAL",
    status: "RESOLVED",
    detectedAt: "2024-01-14T14:22:00Z",
    unit: "Production Unit C",
    category: "MECHANICAL_ISSUE",
  },
];

const severityColors = {
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

const statusIcons = {
  OPEN: AlertTriangle,
  IN_PROGRESS: Clock,
  RESOLVED: CheckCircle,
  CLOSED: AlertCircle,
};

export default function AnomaliesPage() {
  const t = useTranslations("sidebar.pages");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSeverity, setSelectedSeverity] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  const filteredAnomalies = mockAnomalies.filter(anomaly => {
    const matchesSearch = anomaly.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         anomaly.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         anomaly.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity = selectedSeverity === "all" || anomaly.severity === selectedSeverity;
    const matchesStatus = selectedStatus === "all" || anomaly.status === selectedStatus;
    
    return matchesSearch && matchesSeverity && matchesStatus;
  });

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t("anomaly_management")}</h1>
          <p className="text-gray-600 mt-1">Monitor and manage system anomalies</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            {t("anomaly_create")}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search anomalies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedSeverity} onValueChange={setSelectedSeverity}>
              <SelectTrigger>
                <SelectValue placeholder="Select severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                <SelectItem value="LOW">Low</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="HIGH">High</SelectItem>
                <SelectItem value="CRITICAL">Critical</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="OPEN">Open</SelectItem>
                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                <SelectItem value="RESOLVED">Resolved</SelectItem>
                <SelectItem value="CLOSED">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Anomalies</p>
                <p className="text-2xl font-bold text-gray-900">{mockAnomalies.length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Open</p>
                <p className="text-2xl font-bold text-red-600">
                  {mockAnomalies.filter(a => a.status === "OPEN").length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-purple-600">
                  {mockAnomalies.filter(a => a.status === "IN_PROGRESS").length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Resolved</p>
                <p className="text-2xl font-bold text-green-600">
                  {mockAnomalies.filter(a => a.status === "RESOLVED").length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Anomalies List */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Anomalies ({filteredAnomalies.length})
        </h2>
        
        {filteredAnomalies.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No anomalies found</h3>
              <p className="text-gray-600">
                Try adjusting your search criteria or create a new anomaly.
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredAnomalies.map((anomaly) => {
            const StatusIcon = statusIcons[anomaly.status as keyof typeof statusIcons];
            return (
              <Card key={anomaly.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <StatusIcon className="h-5 w-5 text-gray-500" />
                        <h3 className="text-lg font-semibold text-gray-900">
                          {anomaly.title}
                        </h3>
                        <Badge variant="secondary" className="font-mono text-xs">
                          {anomaly.id}
                        </Badge>
                      </div>
                      <p className="text-gray-600 mb-3">{anomaly.description}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>Unit: {anomaly.unit}</span>
                        <span>•</span>
                        <span>Detected: {new Date(anomaly.detectedAt).toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="flex gap-2">
                        <Badge className={severityColors[anomaly.severity as keyof typeof severityColors]}>
                          {anomaly.severity}
                        </Badge>
                        <Badge className={statusColors[anomaly.status as keyof typeof statusColors]}>
                          {anomaly.status}
                        </Badge>
                      </div>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
} 