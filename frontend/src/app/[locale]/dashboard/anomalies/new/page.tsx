"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useState } from "react";
import { ArrowLeft, Save, Send } from "lucide-react";
import { useRouter } from "next/navigation";

export default function NewAnomalyPage() {
  const t = useTranslations("sidebar.pages");
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    severity: "",
    unit: "",
    category: "",
    detectedAt: "",
    reportedBy: "",
    initialObservation: "",
    expectedBehavior: "",
    actualBehavior: "",
    impactAssessment: "",
    urgency: "",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log("Form submitted:", formData);
    // Redirect to list or detail view
    router.push("/dashboard/anomalies");
  };

  const handleSaveDraft = () => {
    // Handle save as draft
    console.log("Saved as draft:", formData);
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
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t("anomaly_create")}</h1>
          <p className="text-gray-600 mt-1">Create a new anomaly report</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Anomaly Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  placeholder="Enter a descriptive title"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Describe the anomaly in detail"
                  rows={4}
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="severity">Severity *</Label>
                  <Select value={formData.severity} onValueChange={(value) => handleInputChange("severity", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select severity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LOW">Low</SelectItem>
                      <SelectItem value="MEDIUM">Medium</SelectItem>
                      <SelectItem value="HIGH">High</SelectItem>
                      <SelectItem value="CRITICAL">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="urgency">Urgency *</Label>
                  <Select value={formData.urgency} onValueChange={(value) => handleInputChange("urgency", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select urgency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LOW">Low</SelectItem>
                      <SelectItem value="MEDIUM">Medium</SelectItem>
                      <SelectItem value="HIGH">High</SelectItem>
                      <SelectItem value="URGENT">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="unit">Production Unit *</Label>
                <Select value={formData.unit} onValueChange={(value) => handleInputChange("unit", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UNIT_A">Production Unit A</SelectItem>
                    <SelectItem value="UNIT_B">Production Unit B</SelectItem>
                    <SelectItem value="UNIT_C">Production Unit C</SelectItem>
                    <SelectItem value="WAREHOUSE">Warehouse</SelectItem>
                    <SelectItem value="QUALITY_CONTROL">Quality Control</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="category">Category *</Label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SENSOR_FAILURE">Sensor Failure</SelectItem>
                    <SelectItem value="MECHANICAL_ISSUE">Mechanical Issue</SelectItem>
                    <SelectItem value="PRESSURE_ANOMALY">Pressure Anomaly</SelectItem>
                    <SelectItem value="TEMPERATURE_ANOMALY">Temperature Anomaly</SelectItem>
                    <SelectItem value="VIBRATION_ANOMALY">Vibration Anomaly</SelectItem>
                    <SelectItem value="ELECTRICAL_ISSUE">Electrical Issue</SelectItem>
                    <SelectItem value="SOFTWARE_ISSUE">Software Issue</SelectItem>
                    <SelectItem value="PROCESS_DEVIATION">Process Deviation</SelectItem>
                    <SelectItem value="QUALITY_ISSUE">Quality Issue</SelectItem>
                    <SelectItem value="SAFETY_CONCERN">Safety Concern</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Detection Details */}
          <Card>
            <CardHeader>
              <CardTitle>Detection Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="detectedAt">Detection Date & Time *</Label>
                <Input
                  id="detectedAt"
                  type="datetime-local"
                  value={formData.detectedAt}
                  onChange={(e) => handleInputChange("detectedAt", e.target.value)}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="reportedBy">Reported By *</Label>
                <Input
                  id="reportedBy"
                  value={formData.reportedBy}
                  onChange={(e) => handleInputChange("reportedBy", e.target.value)}
                  placeholder="Enter reporter name or ID"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="initialObservation">Initial Observation *</Label>
                <Textarea
                  id="initialObservation"
                  value={formData.initialObservation}
                  onChange={(e) => handleInputChange("initialObservation", e.target.value)}
                  placeholder="Describe what was initially observed"
                  rows={3}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="expectedBehavior">Expected Behavior</Label>
                <Textarea
                  id="expectedBehavior"
                  value={formData.expectedBehavior}
                  onChange={(e) => handleInputChange("expectedBehavior", e.target.value)}
                  placeholder="Describe the expected normal behavior"
                  rows={2}
                />
              </div>
              
              <div>
                <Label htmlFor="actualBehavior">Actual Behavior</Label>
                <Textarea
                  id="actualBehavior"
                  value={formData.actualBehavior}
                  onChange={(e) => handleInputChange("actualBehavior", e.target.value)}
                  placeholder="Describe the actual observed behavior"
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Impact Assessment */}
        <Card>
          <CardHeader>
            <CardTitle>Impact Assessment</CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <Label htmlFor="impactAssessment">Impact Assessment</Label>
              <Textarea
                id="impactAssessment"
                value={formData.impactAssessment}
                onChange={(e) => handleInputChange("impactAssessment", e.target.value)}
                placeholder="Describe the potential or actual impact of this anomaly"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleSaveDraft}
          >
            <Save className="h-4 w-4 mr-2" />
            Save Draft
          </Button>
          <Button type="submit">
            <Send className="h-4 w-4 mr-2" />
            Submit Anomaly
          </Button>
        </div>
      </form>
    </div>
  );
} 