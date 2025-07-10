"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import {
  ArrowLeft,
  Plus,
  FileSpreadsheet
} from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { NewAnomalyModal } from "@/components/anomaly/NewAnomalyModal";
import { BatchUploadModal } from "@/components/anomaly/BatchUploadModal";





export default function AddAnomaliesPage() {
  const t = useTranslations("sidebar.pages");
  const router = useRouter();
  
  // New Anomaly Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);

  // State
  const [selectedMethod, setSelectedMethod] = useState<'batch' | 'single' | null>(null);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);



  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleModalSuccess = () => {
    router.push("/dashboard/anomalies");
  };

  const openBatchModal = () => {
    setIsBatchModalOpen(true);
  };

  const closeBatchModal = () => {
    setIsBatchModalOpen(false);
  };

  const handleBatchSuccess = () => {
    router.push("/dashboard/anomalies");
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
            <span className="text-gray-900 font-medium">Add Anomalies</span>
          </nav>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Add Anomalies</h1>
            <p className="text-sm text-gray-600">Choose your preferred method to add anomalies to the system</p>
          </div>
        </div>
      </div>

      {/* Method Selection Cards */}
      <div className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card
            className={cn(
              "border-2 border-dashed transition-colors cursor-pointer group",
              selectedMethod === 'batch'
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 hover:border-blue-300"
            )}
            onClick={() => {
              setSelectedMethod('batch');
              openBatchModal();
            }}
          >
            <CardContent className="p-6 text-center">
              <div className={cn(
                "w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors",
                selectedMethod === 'batch'
                  ? "bg-blue-600 text-white"
                  : "bg-blue-100 text-blue-600 group-hover:bg-blue-200"
              )}>
                <FileSpreadsheet className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Batch Upload</h3>
              <p className="text-sm text-gray-600 mb-4">Upload multiple anomalies at once using CSV or Excel files</p>
              <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                <span>•</span>
                <span>Faster for multiple records</span>
                <span>•</span>
                <span>Template provided</span>
              </div>
              {selectedMethod === 'batch' && (
                <div className="mt-4">
                  <Badge className="bg-blue-600 text-white">Selected</Badge>
                </div>
              )}
            </CardContent>
          </Card>

          <Card
            className={cn(
              "border-2 border-dashed transition-colors cursor-pointer group",
              selectedMethod === 'single'
                ? "border-green-500 bg-green-50"
                : "border-gray-200 hover:border-green-300"
            )}
            onClick={() => {
              setSelectedMethod('single');
              openModal();
            }}
          >
            <CardContent className="p-6 text-center">
              <div className={cn(
                "w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors",
                selectedMethod === 'single'
                  ? "bg-green-600 text-white"
                  : "bg-green-100 text-green-600 group-hover:bg-green-200"
              )}>
                <Plus className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Single Anomaly</h3>
              <p className="text-sm text-gray-600 mb-4">Add one anomaly at a time with guided form</p>
              <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                <span>•</span>
                <span>Step-by-step guidance</span>
                <span>•</span>
                <span>AI-powered analysis</span>
              </div>
              {selectedMethod === 'single' && (
                <div className="mt-4">
                  <Badge className="bg-green-600 text-white">Selected</Badge>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Individual Anomaly Modal */}
      <NewAnomalyModal 
        isOpen={isModalOpen}
        onClose={closeModal}
        onSuccess={handleModalSuccess}
      />

      {/* Batch Upload Modal */}
      <BatchUploadModal 
        isOpen={isBatchModalOpen}
        onClose={closeBatchModal}
        onSuccess={handleBatchSuccess}
      />
    </div>
  );
} 