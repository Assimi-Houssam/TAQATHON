"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  Edit, 
  Share2, 
  Download, 
  Clock, 
  AlertTriangle, 
  CheckCircle,
  User,
  Activity,
  FileText,
  MessageSquare,
  Settings
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

// Mock data for demonstration
const mockAnomalyDetail = {
  id: "ANM-001",
  title: "Temperature Sensor Malfunction",
  description: "Temperature sensor in Unit A shows irregular readings with values fluctuating between 45°C and 85°C when normal operating temperature should be 55°C ± 5°C",
  severity: "HIGH",
  status: "OPEN",
  category: "SENSOR_FAILURE",
  unit: "Production Unit A",
  detectedAt: "2024-01-15T08:30:00Z",
  reportedBy: "John Smith",
  reporterId: "EMP-001",
  initialObservation: "Temperature readings from sensor TMP-A01 showing erratic behavior during morning shift. Values jumping between 45°C and 85°C every 30 seconds.",
  expectedBehavior: "Temperature should maintain steady reading of 55°C ± 5°C during normal operation",
  actualBehavior: "Temperature readings fluctuating wildly between 45°C and 85°C with no apparent pattern",
  impactAssessment: "High impact - could affect product quality and potentially trigger safety shutdowns if not addressed promptly",
  assignedTo: "Sarah Johnson",
  priority: "HIGH",
  createdAt: "2024-01-15T08:35:00Z",
  updatedAt: "2024-01-15T10:15:00Z",
  estimatedResolution: "2024-01-16T16:00:00Z",
};

const mockTimeline = [
  {
    id: 1,
    timestamp: "2024-01-15T08:30:00Z",
    action: "Anomaly Detected",
    description: "Temperature sensor anomaly detected by monitoring system",
    user: "System",
    type: "detection"
  },
  {
    id: 2,
    timestamp: "2024-01-15T08:35:00Z",
    action: "Anomaly Reported",
    description: "Anomaly reported by shift supervisor",
    user: "John Smith",
    type: "report"
  },
  {
    id: 3,
    timestamp: "2024-01-15T09:00:00Z",
    action: "Investigation Started",
    description: "Technical team notified and investigation initiated",
    user: "Sarah Johnson",
    type: "investigation"
  },
  {
    id: 4,
    timestamp: "2024-01-15T10:15:00Z",
    action: "Status Update",
    description: "Preliminary investigation completed, sensor replacement scheduled",
    user: "Sarah Johnson",
    type: "update"
  },
];

const mockComments = [
  {
    id: 1,
    user: "John Smith",
    timestamp: "2024-01-15T08:35:00Z",
    message: "First noticed the issue during routine monitoring. Temperature readings appear completely unreliable."
  },
  {
    id: 2,
    user: "Sarah Johnson",
    timestamp: "2024-01-15T10:15:00Z",
    message: "Checked the sensor connections and found some corrosion on the terminals. Scheduling sensor replacement for tomorrow."
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

export default function AnomalyDetailPage() {
  const t = useTranslations("sidebar.pages");
  const router = useRouter();
  const [newComment, setNewComment] = useState("");

  const handleAddComment = () => {
    if (newComment.trim()) {
      // Handle comment submission
      console.log("Adding comment:", newComment);
      setNewComment("");
    }
  };

  const handleStatusChange = (newStatus: string) => {
    // Handle status change
    console.log("Changing status to:", newStatus);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center gap-4 mb-6">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{t("anomaly_detail")}</h1>
          <p className="text-gray-600 mt-1">Anomaly ID: {mockAnomalyDetail.id}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button size="sm">
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
              <TabsTrigger value="comments">Comments</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5" />
                    {mockAnomalyDetail.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <Badge className={severityColors[mockAnomalyDetail.severity as keyof typeof severityColors]}>
                      {mockAnomalyDetail.severity}
                    </Badge>
                    <Badge className={statusColors[mockAnomalyDetail.status as keyof typeof statusColors]}>
                      {mockAnomalyDetail.status}
                    </Badge>
                    <Badge variant="outline">
                      {mockAnomalyDetail.category.replace("_", " ")}
                    </Badge>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2">Description</h3>
                    <p className="text-gray-700">{mockAnomalyDetail.description}</p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2">Initial Observation</h3>
                    <p className="text-gray-700">{mockAnomalyDetail.initialObservation}</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold mb-2">Expected Behavior</h4>
                      <p className="text-gray-700 text-sm">{mockAnomalyDetail.expectedBehavior}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Actual Behavior</h4>
                      <p className="text-gray-700 text-sm">{mockAnomalyDetail.actualBehavior}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2">Impact Assessment</h3>
                    <p className="text-gray-700">{mockAnomalyDetail.impactAssessment}</p>
                  </div>
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

            <TabsContent value="comments" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Comments
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {mockComments.map((comment) => (
                    <div key={comment.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-500" />
                          <span className="font-semibold">{comment.user}</span>
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(comment.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-gray-700">{comment.message}</p>
                    </div>
                  ))}
                  
                  <div className="border-t pt-4">
                    <Label htmlFor="new-comment">Add Comment</Label>
                    <Textarea
                      id="new-comment"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Add a comment..."
                      rows={3}
                      className="mt-2"
                    />
                    <Button 
                      onClick={handleAddComment}
                      className="mt-2"
                      disabled={!newComment.trim()}
                    >
                      Add Comment
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="documents" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Related Documents
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No documents attached yet</p>
                    <Button variant="outline" className="mt-2">
                      Upload Document
                    </Button>
                  </div>
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
                Quick Actions
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
              >
                <User className="h-4 w-4 mr-2" />
                Assign to Team
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Detected:</span>
                  <span className="text-sm">{new Date(mockAnomalyDetail.detectedAt).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Reported by:</span>
                  <span className="text-sm">{mockAnomalyDetail.reportedBy}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Assigned to:</span>
                  <span className="text-sm">{mockAnomalyDetail.assignedTo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Unit:</span>
                  <span className="text-sm">{mockAnomalyDetail.unit}</span>
                </div>
                                 <div className="flex justify-between">
                   <span className="text-sm text-gray-600">Priority:</span>
                   <Badge className={severityColors[mockAnomalyDetail.priority as keyof typeof severityColors]}>
                     {mockAnomalyDetail.priority}
                   </Badge>
                 </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 