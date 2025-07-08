"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Circle, PlayCircle, Save, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { AnomalyWithRelations, STATUS_TRANSITIONS } from "@/types/anomaly";
import { AnomalySummary } from "./AnomalySummary";
import { NewTabContent } from "./NewTabContent";
import { InProgressTabContent } from "./InProgressTabContent";
import { ClosedTabContent } from "./ClosedTabContent";

interface AnomalyProfileProps {
  anomaly: AnomalyWithRelations;
  onStatusChange?: (newStatus: AnomalyWithRelations['status']) => Promise<void>;
  onUpdate?: (updates: Partial<AnomalyWithRelations>) => Promise<void>;
  onValidate?: () => Promise<void>;
}

const LIFECYCLE_STEPS = [
  { key: "new", label: "New", description: "Configure anomaly", status: "NEW" },
  { key: "in-progress", label: "In Progress", description: "Execute maintenance", status: "IN_PROGRESS" },
  { key: "closed", label: "Closed", description: "Document resolution", status: "CLOSED" }
];

export function AnomalyProfile({ anomaly, onStatusChange, onUpdate, onValidate }: AnomalyProfileProps) {
  const [activeStep, setActiveStep] = useState(() => {
    switch (anomaly.status) {
      case "NEW": return "new";
      case "IN_PROGRESS": return "in-progress"; 
      case "CLOSED": return "closed";
      default: return "new";
    }
  });
  
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [rexSaveFunction, setRexSaveFunction] = useState<(() => Promise<void>) | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<string | null>(null);

  // Auto-update active step when anomaly status changes
  useEffect(() => {
    switch (anomaly.status) {
      case "NEW":
        setActiveStep("new");
        break;
      case "IN_PROGRESS":
        setActiveStep("in-progress");
        break;
      case "CLOSED":
        setActiveStep("closed");
        break;
    }
  }, [anomaly.status]);

  const getCurrentStepIndex = () => {
    return LIFECYCLE_STEPS.findIndex(step => step.key === activeStep);
  };

  const getStepStatus = (stepKey: string) => {
    const stepIndex = LIFECYCLE_STEPS.findIndex(step => step.key === stepKey);
    const currentIndex = getCurrentStepIndex();
    
    if (stepIndex < currentIndex) return "completed";
    if (stepIndex === currentIndex) return "current";
    return "pending";
  };

  const canAccessStep = (stepKey: string) => {
    switch (stepKey) {
      case "new": return anomaly.status === "NEW";
      case "in-progress": return anomaly.status === "IN_PROGRESS" || anomaly.status === "CLOSED";
      case "closed": return anomaly.status === "CLOSED";
      default: return false;
    }
  };

  const handleStatusTransition = async (newStatus: AnomalyWithRelations['status']) => {
    if (!anomaly.status || !newStatus || !STATUS_TRANSITIONS[anomaly.status].includes(newStatus) || !onStatusChange) return;
    
    try {
      await onStatusChange(newStatus);
      // The tab will be updated automatically via useEffect when anomaly.status changes
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  const handleUpdate = async (updates: Partial<AnomalyWithRelations>) => {
    if (!onUpdate) return;
    
    try {
      await onUpdate(updates);
    } catch (error) {
      console.error("Failed to update anomaly:", error);
      throw error;
    }
  };

  const executeConfirmedAction = async () => {
    setIsActionLoading(true);
    try {
      if (pendingAction === "validate" && anomaly.status === "NEW") {
        if (onValidate) {
          // Wait for the markAsTreated mutation to complete
          // React Query will automatically update the cache and invalidate queries
          await onValidate();
          toast.success("Anomaly validated and moved to In Progress successfully!");
        } else {
          await handleStatusTransition("IN_PROGRESS");
          toast.success("Anomaly status updated to In Progress!");
        }
      } else if (pendingAction === "complete" && anomaly.status === "IN_PROGRESS") {
        await handleStatusTransition("CLOSED");
        toast.success("Anomaly resolution completed and closed successfully!");
      } else if (pendingAction === "document" && anomaly.status === "CLOSED" && rexSaveFunction) {
        await rexSaveFunction();
        toast.success("Documentation completed successfully!");
      }
    } catch (error) {
      console.error("Failed to execute main action:", error);
      // Show appropriate error message based on the action
      const errorMessage = 
        pendingAction === "validate" ? "Failed to validate anomaly. Please try again." :
        pendingAction === "complete" ? "Failed to complete resolution. Please try again." :
        pendingAction === "document" ? "Failed to complete documentation. Please try again." :
        "Failed to execute action. Please try again.";
      
      toast.error(errorMessage);
    } finally {
      setIsActionLoading(false);
      setShowConfirmModal(false);
      setPendingAction(null);
    }
  };

  const handleMainAction = async () => {
    if (activeStep === "new" && anomaly.status === "NEW") {
      setPendingAction("validate");
      setShowConfirmModal(true);
    } else if (activeStep === "in-progress" && anomaly.status === "IN_PROGRESS") {
      setPendingAction("complete");
      setShowConfirmModal(true);
    } else if (activeStep === "closed" && anomaly.status === "CLOSED" && rexSaveFunction) {
      setPendingAction("document");
      setShowConfirmModal(true);
    }
  };

  const getConfirmationMessage = () => {
    switch (pendingAction) {
      case "validate":
        return {
          title: "Validate Anomaly",
          description: "This will mark the anomaly as validated and move it to In Progress status."
        };
      case "complete":
        return {
          title: "Complete Resolution", 
          description: "This will mark the anomaly resolution as complete and close the anomaly."
        };
      case "document":
        return {
          title: "Complete Documentation",
          description: "This will finalize all documentation for this anomaly."
        };
      default:
        return {
          title: "Confirm Action",
          description: "Are you sure you want to proceed?"
        };
    }
  };

  const getMainActionButton = () => {
    if (activeStep === "new" && anomaly.status === "NEW") {
      return (
        <Button
          onClick={handleMainAction}
          disabled={isActionLoading}
          className="w-full border px-6 py-4 rounded-lg font-medium transition-all duration-200 disabled:opacity-70"
          size="lg"
        >
          {isActionLoading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
              Validating Anomaly...
            </>
          ) : (
            <>
              <CheckCircle className="h-5 w-5 mr-3" />
              Validate Anomaly
            </>
          )}
        </Button>
      );
    }
    
    if (activeStep === "in-progress" && anomaly.status === "IN_PROGRESS") {
      return (
        <Button
          onClick={handleMainAction}
          disabled={isActionLoading}
          className="w-full border px-6 py-4 rounded-lg font-medium transition-all duration-200 disabled:opacity-70"
          size="lg"
        >
          {isActionLoading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
              Completing Resolution...
            </>
          ) : (
            <>
              <CheckCircle className="h-5 w-5 mr-3" />
              Complete Resolution
            </>
          )}
        </Button>
      );
    }
    
    if (activeStep === "closed" && anomaly.status === "CLOSED") {
      return (
        <Button
          onClick={handleMainAction}
          disabled={isActionLoading || !rexSaveFunction}
          className="w-full border px-6 py-4 rounded-lg font-medium transition-all duration-200 disabled:opacity-50"
          size="lg"
        >
          {isActionLoading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
              Completing Documentation...
            </>
          ) : (
            <>
              <CheckCircle className="h-5 w-5 mr-3" />
              Complete Documentation
            </>
          )}
        </Button>
      );
    }
    
    return null;
  };

  const getStepIcon = (stepKey: string) => {
    const status = getStepStatus(stepKey);
    switch (status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "current":
        return <PlayCircle className="h-5 w-5 text-blue-600" />;
      default:
        return <Circle className="h-5 w-5 text-gray-400" />;
    }
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case "new":
        return anomaly.status === "NEW" && onStatusChange && onUpdate ? (
          <NewTabContent 
            anomaly={anomaly} 
            onUpdate={handleUpdate}
            onStatusChange={handleStatusTransition}
          />
        ) : (
          <div className="text-center py-12">
            <CheckCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Configuration Complete</h3>
            <p className="text-gray-600">This anomaly has been configured and moved to the next stage.</p>
          </div>
        );
      
      case "in-progress":
        return (anomaly.status === "IN_PROGRESS" || anomaly.status === "CLOSED") && onStatusChange && onUpdate ? (
          <InProgressTabContent 
            anomaly={anomaly} 
            onUpdate={handleUpdate}
            onStatusChange={handleStatusTransition}
          />
        ) : (
          <div className="text-center py-12">
            <Circle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Awaiting Progress</h3>
            <p className="text-gray-600">Complete the configuration step first.</p>
          </div>
        );
      
      case "closed":
        return anomaly.status === "CLOSED" && onUpdate ? (
          <ClosedTabContent 
            anomaly={anomaly} 
          />
        ) : (
          <div className="text-center py-12">
            <Circle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Not Yet Closed</h3>
            <p className="text-gray-600">Complete the previous steps first.</p>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div>
      {/* Enhanced Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-lg w-full mx-4 shadow-xl">
            {/* Loading Overlay */}
            {isActionLoading && (
              <div className="absolute inset-0 bg-white bg-opacity-90 rounded-xl flex items-center justify-center z-10">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
                  <p className="text-sm text-gray-600 font-medium">
                    {pendingAction === "validate" ? "Validating anomaly..." :
                     pendingAction === "complete" ? "Completing resolution..." :
                     pendingAction === "document" ? "Finalizing documentation..." :
                     "Processing..."}
                  </p>
                </div>
              </div>
            )}
            
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {getConfirmationMessage().title}
              </h3>
              <p className="text-gray-600 text-sm">
                {getConfirmationMessage().description}
              </p>
            </div>
            
            <div className="flex justify-between space-x-3">
              <Button
                onClick={() => {
                  setShowConfirmModal(false);
                  setPendingAction(null);
                }}
                variant="outline"
                className=""
                disabled={isActionLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={executeConfirmedAction}
                className=""
                disabled={isActionLoading}
              >
                {isActionLoading ? 
                  (pendingAction === "validate" ? "Validating..." :
                   pendingAction === "complete" ? "Completing..." :
                   pendingAction === "document" ? "Documenting..." :
                   "Processing...") 
                  : "Confirm"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Clean Progress Stepper */}
      <div className="mb-6 p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between">
          {LIFECYCLE_STEPS.map((step, index) => {
            const status = getStepStatus(step.key);
            const isClickable = canAccessStep(step.key);
            
            return (
              <div key={step.key} className="flex items-center flex-1">
                {/* Step Node */}
                <div className="relative flex items-center">
                  <button
                    onClick={() => isClickable && setActiveStep(step.key)}
                    disabled={!isClickable}
                    className={`
                      relative flex items-center justify-center w-6 h-6 rounded-full transition-all duration-200 border-2
                      ${status === "completed" 
                        ? "bg-blue-600 border-blue-600" 
                        : status === "current"
                        ? "bg-blue-500 border-blue-500"
                        : "bg-white border-gray-300"
                      }
                      ${isClickable ? "hover:scale-110 cursor-pointer" : "cursor-not-allowed"}
                    `}
                  >
                    {status === "completed" && (
                      <CheckCircle className="h-3 w-3 text-white" />
                    )}
                    {status === "current" && (
                      <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                    )}
                    {status === "pending" && (
                      <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                    )}
                  </button>
                  
                  {/* Step Label */}
                  <div className="ml-2">
                    <div className={`text-xs font-medium ${
                      status === "current" ? "text-blue-600" : 
                      status === "completed" ? "text-gray-900" : "text-gray-500"
                    }`}>
                      {step.label}
                    </div>
                  </div>
                </div>
                
                {/* Progress Line */}
                {index < LIFECYCLE_STEPS.length - 1 && (
                  <div className="flex-1 mx-3 h-0.5 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 ease-in-out ${
                        index < getCurrentStepIndex() 
                          ? "bg-blue-500" 
                          : "bg-gray-200"
                      }`}
                      style={{
                        width: index < getCurrentStepIndex() ? "100%" : 
                               index === getCurrentStepIndex() ? "50%" : "0%"
                      }}
                    />
                  </div>
                )}
              </div>
            );
          })}

          {/* Progress Percentage */}
          <div className="ml-4">
            <div className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-medium">
              {Math.round(((getCurrentStepIndex() + 1) / LIFECYCLE_STEPS.length) * 100)}%
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Main Content - Left Side */}
        <div className="xl:col-span-3 order-2 xl:order-1">
          <Card className="shadow-sm border-none shadow-none bg-transparent">
            <CardContent className="p-0">
              {renderStepContent()}
            </CardContent>
          </Card>
        </div>

        {/* Anomaly Details - Right Side */}
        <div className="xl:col-span-1 order-1 xl:order-2">
          <div className="flex justify-center w-full mb-4">
            {getMainActionButton()}
          </div>
          <div className="xl:sticky xl:top-20">
            <AnomalySummary anomaly={anomaly} />
          </div>
        </div>
      </div>
    </div>
  );
}
