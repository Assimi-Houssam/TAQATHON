"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  Edit, 
  Clock, 
  AlertTriangle, 
  CheckCircle,
  Wrench,
  Activity,
  FileText,
  Settings,
  MapPin,
  Tag,
  Shield,
  AlertCircle
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { AnomalyDisplay } from "@/types/anomaly";

// Mock data based on the schema
const mockAnomalyDetail: AnomalyDisplay = {
  id: "ANM-001",
  num_equipments: "EQ-001",
  unite: "Production Unit A",
  systeme: "Pressure Control System",
  descreption_anomalie: "Irregular pressure readings detected in main pipeline. Sensor shows fluctuating values between 2.5 and 4.2 bar when normal operating pressure should be 3.0 ± 0.2 bar.",
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
    description: "Primary pressure monitoring sensor for production line A. Critical for maintaining safe operating conditions."
  },
  atachments_id: "ATT-001",
  atachments: {
    id: "ATT-001",
    file_name: "pressure_readings.pdf",
    file_path: "/uploads/pressure_readings.pdf",
    anomalies: []
  },
  rex_id: "REX-001",
  rex_entrie: {
    id: "REX-001",
    summary: "Similar pressure sensor malfunction occurred in 2023. Resolution involved sensor replacement and calibration.",
    docment_path: "/documents/rex_pressure_sensor_2023.pdf"
  }
};

const mockTimeline = [
  {
    id: 1,
    timestamp: "2024-01-15T08:30:00Z",
    action: "Anomaly Detected",
    description: "Pressure sensor anomaly detected by monitoring system",
    user: "System",
    type: "detection"
  },
  {
    id: 2,
    timestamp: "2024-01-15T08:35:00Z",
    action: "Anomaly Logged",
    description: "Anomaly automatically logged in the system",
    user: "System",
    type: "system"
  },
  {
    id: 3,
    timestamp: "2024-01-15T09:00:00Z",
    action: "Investigation Started",
    description: "Production team notified and investigation initiated",
    user: "Production Team",
    type: "investigation"
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

export default function AnomalyDetailPage() {
  const t = useTranslations("sidebar.pages");
  const router = useRouter();
  const [newComment, setNewComment] = useState("");

  const handleStatusChange = (newStatus: string) => {
    // Handle status change
    console.log("Changing status to:", newStatus);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-8 pb-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => router.push("/dashboard/anomalies")}
              className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <nav className="flex items-center gap-1 text-sm">
              <span className="text-gray-500 hover:text-gray-700 cursor-pointer">Anomaly Management</span>
              <span className="text-gray-400">/</span>
              <span className="text-gray-900 font-medium">Details</span>
            </nav>
          </div>
          <Button 
            size="sm"
            variant="outline"
            onClick={() => router.push(`/dashboard/anomalies/edit/${mockAnomalyDetail.id}`)}
            className="hover:bg-gray-50"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Anomaly Details</h1>
          <p className="text-sm text-gray-600">
            Viewing anomaly <span className="font-mono font-medium text-gray-900">{mockAnomalyDetail.id}</span> • 
            Equipment <span className="font-mono font-medium text-gray-900">{mockAnomalyDetail.num_equipments}</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="equipment">Equipment</TabsTrigger>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
              <TabsTrigger value="rex">REX</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5" />
                    Anomaly Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <Badge className={criticiteColors[mockAnomalyDetail.criticite_display]}>
                      {mockAnomalyDetail.criticite_display}
                    </Badge>
                    <Badge className={statusColors[mockAnomalyDetail.status]}>
                      {mockAnomalyDetail.status.replace("_", " ")}
                    </Badge>
                    <Badge variant="outline">
                      {mockAnomalyDetail.systeme}
                    </Badge>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2">Description</h3>
                    <p className="text-gray-700">{mockAnomalyDetail.descreption_anomalie}</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold mb-2">Origin</h4>
                      <p className="text-gray-700">{mockAnomalyDetail.origine}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Owner Section</h4>
                      <p className="text-gray-700">{mockAnomalyDetail.section_proprietaire}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <h4 className="font-semibold mb-2">Reliability & Integrity</h4>
                      <Badge variant="outline">{mockAnomalyDetail.fiablite_integrite}</Badge>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Availability</h4>
                      <Badge variant="outline">{mockAnomalyDetail.disponsibilite}</Badge>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Process Safety</h4>
                      <Badge variant="outline">{mockAnomalyDetail.process_safty}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="equipment" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wrench className="h-5 w-5" />
                    Equipment Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {mockAnomalyDetail.equipement && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-semibold mb-2 flex items-center gap-2">
                            <Tag className="h-4 w-4" />
                            Equipment Details
                          </h4>
                          <div className="space-y-2">
                            <p><strong>Name:</strong> {mockAnomalyDetail.equipement.name}</p>
                            <p><strong>Tag Number:</strong> {mockAnomalyDetail.equipement.tag_number}</p>
                            <p><strong>Equipment ID:</strong> {mockAnomalyDetail.num_equipments}</p>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2 flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            Location
                          </h4>
                          <p>{mockAnomalyDetail.equipement.location}</p>
                          <p className="text-sm text-gray-600 mt-1">Unit: {mockAnomalyDetail.unite}</p>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold mb-2">Description</h4>
                        <p className="text-gray-700">{mockAnomalyDetail.equipement.description}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="timeline" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Activity Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockTimeline.map((item) => (
                      <div key={item.id} className="flex gap-4 p-4 border rounded-lg">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <Clock className="h-4 w-4 text-blue-600" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-semibold">{item.action}</h4>
                              <p className="text-gray-600 text-sm">{item.description}</p>
                            </div>
                            <div className="text-right text-sm text-gray-500">
                              <p>{item.user}</p>
                              <p>{new Date(item.timestamp).toLocaleString()}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="rex" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    REX (Return of Experience)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {mockAnomalyDetail.rex_entrie ? (
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2">Summary</h4>
                        <p className="text-gray-700">{mockAnomalyDetail.rex_entrie.summary}</p>
                      </div>
                      
                      {mockAnomalyDetail.rex_entrie.docment_path && (
                        <div>
                          <h4 className="font-semibold mb-2">Related Documents</h4>
                          <Button variant="outline" size="sm">
                            <FileText className="h-4 w-4 mr-2" />
                            View REX Document
                          </Button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No REX entry available</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => handleStatusChange("IN_PROGRESS")}
              >
                <Clock className="h-4 w-4 mr-2" />
                Start Investigation
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => handleStatusChange("RESOLVED")}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Mark as Resolved
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                disabled={!mockAnomalyDetail.atachments}
              >
                <FileText className="h-4 w-4 mr-2" />
                View Attachments
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Detected:</span>
                <span className="text-sm">{mockAnomalyDetail.date_detection.toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Equipment:</span>
                <span className="text-sm font-mono">{mockAnomalyDetail.num_equipments}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Unit:</span>
                <span className="text-sm">{mockAnomalyDetail.unite}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">System:</span>
                <span className="text-sm">{mockAnomalyDetail.systeme}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Criticality:</span>
                <Badge className={criticiteColors[mockAnomalyDetail.criticite_display]}>
                  {mockAnomalyDetail.criticite_display}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Status:</span>
                <Badge className={statusColors[mockAnomalyDetail.status]}>
                  {mockAnomalyDetail.status.replace("_", " ")}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {mockAnomalyDetail.atachments && (
            <Card>
              <CardHeader>
                <CardTitle>Attachments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 p-2 border rounded">
                  <FileText className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{mockAnomalyDetail.atachments.file_name}</span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
} 