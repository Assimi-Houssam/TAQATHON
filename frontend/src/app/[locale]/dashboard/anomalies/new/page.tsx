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
            <span className="text-gray-900 font-medium">New Anomaly</span>
          </nav>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">New Anomaly</h1>
          <p className="text-sm text-gray-600">Create a new anomaly report for equipment monitoring</p>
        </div>
      </div>

      <div className="w-full">
        {/* TODO: Page content */}
      </div>

      
      
    </div>
  );
} 