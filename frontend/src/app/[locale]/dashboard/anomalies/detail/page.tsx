"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { AnomalyProfile } from "@/components/anomaly/AnomalyProfile";
import { AnomalyWithRelations } from "@/types/anomaly";
import { useAnomaly, useAnomalyMutations } from "@/hooks/useAnomalies";

export default function AnomalyDetailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const anomalyId = searchParams.get('id');
  
  // Fetch anomaly data from backend
  const { data: anomaly, isLoading, error } = useAnomaly(anomalyId || '');
  const { updateAnomaly, markAsTreated } = useAnomalyMutations();

  const handleValidateAnomaly = async () => {
    if (!anomalyId) return;
    try {
      // Use markAsTreated for the validation process from new to in progress
      await markAsTreated.mutateAsync(anomalyId);
    } catch (error) {
      console.error("Failed to validate anomaly:", error);
      throw error; // Re-throw to let the component handle the error
    }
  };

  const handleUpdate = async (updates: Partial<AnomalyWithRelations>) => {
    if (!anomalyId) return;
    try {
      await updateAnomaly.mutateAsync({ id: anomalyId, data: updates });
    } catch (error) {
      console.error("Failed to update anomaly:", error);
      throw error; // Re-throw to let the component handle the error
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className=" px-6 py-6">
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
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Anomaly Profile</h1>
            <p className="text-sm text-gray-600">Loading anomaly details...</p>
          </div>
        </div>
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-zinc-600 mt-4">Loading anomaly...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className=" px-6 py-6">
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
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Anomaly Profile</h1>
            <p className="text-sm text-gray-600">Error loading anomaly details</p>
          </div>
        </div>
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-zinc-900 mb-2">Error Loading Anomaly</h2>
            <p className="text-zinc-600 mb-4">There was an error loading the anomaly data. Please try again.</p>
            <Button onClick={() => window.location.reload()}>
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // No anomaly found
  if (!anomaly) {
    return (
      <div className=" px-6 py-6">
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
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Anomaly Profile</h1>
            <p className="text-sm text-gray-600">Anomaly not found</p>
          </div>
        </div>
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-zinc-900 mb-2">Anomaly Not Found</h2>
            <p className="text-zinc-600 mb-4">The requested anomaly could not be found.</p>
            <Button onClick={() => router.push("/dashboard/anomalies")}>
              Back to Anomalies
            </Button>
          </div>
        </div>
      </div>
    );
  }

  var id_to_print = anomaly?.num_equipments || anomaly?.id || 'Anomaly';
  id_to_print = id_to_print.slice(-5).toUpperCase();

  return (
    <div className=" px-6 py-6">
      {/* Loading Overlay for Mutations */}
      {markAsTreated.isPending && (
        <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-40">
          <div className="bg-white rounded-xl p-6 shadow-xl">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
              <p className="text-sm text-gray-600 font-medium">Updating anomaly status...</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Header with consistent layout matching other pages */}
      <div className="mb-8 pb-6 border-b border-gray-200">
        <div className="flex items-center gap-3 mb-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => router.push("/dashboard/anomalies")}
              className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md"
              disabled={markAsTreated.isPending}
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
              Managing {id_to_print} through its lifecycle
          </p>
          </div>
        </div>
      </div>

      {/* AnomalyProfile Component */}
      <AnomalyProfile 
        anomaly={anomaly!}
        onStatusChange={async (newStatus) => {
          // Handle status change logic here
        }}
        onUpdate={handleUpdate}
        onValidate={handleValidateAnomaly}
      />
    </div>
  );
} 