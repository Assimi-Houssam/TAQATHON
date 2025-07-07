"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { AnomalyProfile } from "@/components/anomaly/AnomalyProfile";
import { AnomalyWithRelations } from "@/types/anomaly";

// Mock data that matches the new interface structure
const mockAnomalyWithRelations: AnomalyWithRelations = {
  id: "ANM-001",
  code: "ANM-001",
  equipment: "Main Pressure Sensor (PS-001)",
  description: "Irregular pressure readings detected in main pipeline. Sensor shows fluctuating values between 2.5 and 4.2 bar when normal operating pressure should be 3.0 ± 0.2 bar.",
  date_apparition: "2024-01-15T08:30:00Z",
  
  // Criticality assessment (1-5 each, total 1-15)
  process_safety: 4,
  fiabilite_integrite: 3,
  disponibilite: 4,
  criticality: 11, // 4 + 3 + 4 = 11 (HIGH)
  
  origin: "Sensor Malfunction",
  
  // Status
  status: "New", // Can be changed to test different tabs
  
  // Timestamps
  created_at: "2024-01-15T08:30:00Z",
  updated_at: "2024-01-15T09:00:00Z",
  
  // Related data
  action_plans: [
    {
      id: "ap-001",
      title: "Sensor Calibration Check",
      description: "Verify sensor calibration parameters and check for drift in measurement accuracy.",
      file_link: "https://example.com/calibration-procedure.pdf",
      anomaly_id: "ANM-001",
      created_at: "2024-01-15T09:00:00Z",
      updated_at: "2024-01-15T09:00:00Z"
    },
    {
      id: "ap-002", 
      title: "Physical Inspection",
      description: "Conduct physical inspection of sensor mounting, connections, and surrounding infrastructure.",
      anomaly_id: "ANM-001",
      created_at: "2024-01-15T09:05:00Z",
      updated_at: "2024-01-15T09:05:00Z"
    }
  ],
  
  maintenance_window: {
    id: "mw-001",
    anomaly_id: "ANM-001",
    scheduled_start: "2024-01-16T14:00:00Z",
    scheduled_end: "2024-01-16T18:00:00Z",
    assigned_team: "Instrumentation Team",
    notes: "Maintenance scheduled during planned downtime. Backup sensors will be activated.",
    duration_of_intervention: 4,
    requires_stopping: false,
    created_at: "2024-01-15T10:00:00Z",
    updated_at: "2024-01-15T10:00:00Z"
  },
  
  rex: {
    id: "rex-001",
    anomaly_id: "ANM-001",
    notes: "Sensor was found to have accumulated debris affecting measurement accuracy. After cleaning and recalibration, readings returned to normal range.",
    lessons_learned: "Regular preventive maintenance schedule should include sensor cleaning every 6 months.",
    created_by: "user-001",
    created_at: "2024-01-17T10:00:00Z",
    file_path: "/uploads/rex/sensor-maintenance-report.pdf"
  }
};

export default function AnomalyDetailPage() {
  const router = useRouter();

  const handleStatusChange = async (newStatus: AnomalyWithRelations['status']) => {
    console.log("Status change requested:", newStatus);
    // In a real app, this would make an API call to update the status
    // For demo purposes, we'll just log it
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Update the mock data status
    mockAnomalyWithRelations.status = newStatus;
    
    console.log("Status updated to:", newStatus);
  };

  const handleUpdate = async (updates: Partial<AnomalyWithRelations>) => {
    console.log("Update requested:", updates);
    // In a real app, this would make an API call to update the anomaly
    // For demo purposes, we'll just log it
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Update the mock data
    Object.assign(mockAnomalyWithRelations, updates);
    
    console.log("Anomaly updated:", updates);
  };

  return (
    <div className="container mx-auto px-6 py-6">
      {/* Header with consistent layout matching other pages */}
      <div className="mb-8 pb-6 border-b border-gray-200">
        <div className="flex items-center gap-3 mb-4">
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
            <span className="text-gray-900 font-medium">Profile</span>
            </nav>
        </div>
        <div className="flex items-center justify-between">
        <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Anomaly Profile</h1>
          <p className="text-sm text-gray-600">
              Managing {mockAnomalyWithRelations.code || mockAnomalyWithRelations.id} through its lifecycle
          </p>
          </div>
        </div>
      </div>

      {/* AnomalyProfile Component */}
      <AnomalyProfile 
        anomaly={mockAnomalyWithRelations}
        onStatusChange={handleStatusChange}
        onUpdate={handleUpdate}
      />
    </div>
  );
} 