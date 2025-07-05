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
    num_equipments: "",
    unite: "",
    systeme: "",
    descreption_anomalie: "",
    origine: "",
    section_proprietaire: "",
    fiablite_integrite: "",
    disponsibilite: "",
    process_safty: "",
    Criticite: "",
    // Equipment details
    equipment_name: "",
    equipment_location: "",
    equipment_tag_number: "",
    equipment_description: "",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log("Form submitted:", formData);
    // Redirect to list view
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
          <h1 className="text-2xl font-bold text-gray-900">New Anomaly</h1>
          <p className="text-gray-600 mt-1">Create a new anomaly report</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Anomaly Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="num_equipments">Equipment Number *</Label>
                <Input
                  id="num_equipments"
                  value={formData.num_equipments}
                  onChange={(e) => handleInputChange("num_equipments", e.target.value)}
                  placeholder="e.g., EQ-001"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="unite">Unit</Label>
                <Input
                  id="unite"
                  value={formData.unite}
                  onChange={(e) => handleInputChange("unite", e.target.value)}
                  placeholder="e.g., Production Unit A"
                />
              </div>
              
              <div>
                <Label htmlFor="systeme">System</Label>
                <Input
                  id="systeme"
                  value={formData.systeme}
                  onChange={(e) => handleInputChange("systeme", e.target.value)}
                  placeholder="e.g., Pressure Control System"
                />
              </div>
              
              <div>
                <Label htmlFor="descreption_anomalie">Anomaly Description *</Label>
                <Textarea
                  id="descreption_anomalie"
                  value={formData.descreption_anomalie}
                  onChange={(e) => handleInputChange("descreption_anomalie", e.target.value)}
                  placeholder="Describe the anomaly in detail"
                  rows={4}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="origine">Origin</Label>
                <Input
                  id="origine"
                  value={formData.origine}
                  onChange={(e) => handleInputChange("origine", e.target.value)}
                  placeholder="e.g., Sensor Malfunction, Calibration Drift"
                />
              </div>
            </CardContent>
          </Card>

          {/* Classification */}
          <Card>
            <CardHeader>
              <CardTitle>Classification</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="section_proprietaire">Owner Section *</Label>
                <Select value={formData.section_proprietaire} onValueChange={(value) => handleInputChange("section_proprietaire", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select section" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Production">Production</SelectItem>
                    <SelectItem value="Maintenance">Maintenance</SelectItem>
                    <SelectItem value="Engineering">Engineering</SelectItem>
                    <SelectItem value="Quality">Quality</SelectItem>
                    <SelectItem value="Safety">Safety</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="Criticite">Criticality *</Label>
                <Select value={formData.Criticite} onValueChange={(value) => handleInputChange("Criticite", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select criticality" />
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
                <Label htmlFor="fiablite_integrite">Reliability & Integrity</Label>
                <Select value={formData.fiablite_integrite} onValueChange={(value) => handleInputChange("fiablite_integrite", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select impact" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="No Impact">No Impact</SelectItem>
                    <SelectItem value="Low Impact">Low Impact</SelectItem>
                    <SelectItem value="Medium Impact">Medium Impact</SelectItem>
                    <SelectItem value="High Impact">High Impact</SelectItem>
                    <SelectItem value="Critical Impact">Critical Impact</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="disponsibilite">Availability</Label>
                <Select value={formData.disponsibilite} onValueChange={(value) => handleInputChange("disponsibilite", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select availability status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Operational">Operational</SelectItem>
                    <SelectItem value="Reduced">Reduced</SelectItem>
                    <SelectItem value="Limited">Limited</SelectItem>
                    <SelectItem value="Shutdown Required">Shutdown Required</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="process_safty">Process Safety</Label>
                <Select value={formData.process_safty} onValueChange={(value) => handleInputChange("process_safty", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select safety level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="No Risk">No Risk</SelectItem>
                    <SelectItem value="Monitor">Monitor</SelectItem>
                    <SelectItem value="Safety Risk">Safety Risk</SelectItem>
                    <SelectItem value="Immediate Action">Immediate Action</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Equipment Details */}
        <Card>
          <CardHeader>
            <CardTitle>Equipment Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="equipment_name">Equipment Name</Label>
                <Input
                  id="equipment_name"
                  value={formData.equipment_name}
                  onChange={(e) => handleInputChange("equipment_name", e.target.value)}
                  placeholder="e.g., Main Pressure Sensor"
                />
              </div>
              
              <div>
                <Label htmlFor="equipment_tag_number">Tag Number</Label>
                <Input
                  id="equipment_tag_number"
                  value={formData.equipment_tag_number}
                  onChange={(e) => handleInputChange("equipment_tag_number", e.target.value)}
                  placeholder="e.g., PS-001"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="equipment_location">Location</Label>
              <Input
                id="equipment_location"
                value={formData.equipment_location}
                onChange={(e) => handleInputChange("equipment_location", e.target.value)}
                placeholder="e.g., Building A - Floor 2"
              />
            </div>
            
            <div>
              <Label htmlFor="equipment_description">Equipment Description</Label>
              <Textarea
                id="equipment_description"
                value={formData.equipment_description}
                onChange={(e) => handleInputChange("equipment_description", e.target.value)}
                placeholder="Describe the equipment"
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
            Create Anomaly
          </Button>
        </div>
      </form>
    </div>
  );
} 