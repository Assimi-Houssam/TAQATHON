"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Circle, PlayCircle, Save, AlertTriangle } from "lucide-react";
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
      if (newStatus === "IN_PROGRESS") {
        setActiveStep("in-progress");
      } else if (newStatus === "CLOSED") {
        setActiveStep("closed");
      }
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
          // Use the markAsTreated mutation for validation
          await onValidate();
          setActiveStep("in-progress");
        } else {
          await handleStatusTransition("IN_PROGRESS");
        }
      } else if (pendingAction === "complete" && anomaly.status === "IN_PROGRESS") {
        await handleStatusTransition("CLOSED");
      } else if (pendingAction === "document" && anomaly.status === "CLOSED" && rexSaveFunction) {
        await rexSaveFunction();
      }
    } catch (error) {
      console.error("Failed to execute main action:", error);
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
        return "Are you sure you want to validate this anomaly and move it to In Progress?";
      case "complete":
        return "Are you sure you want to complete the resolution and close this anomaly?";
      case "document":
        return "Are you sure you want to complete the documentation for this anomaly?";
      default:
        return "Are you sure you want to proceed?";
    }
  };

  const getConfirmationTitle = () => {
    switch (pendingAction) {
      case "validate":
        return "Validate Anomaly";
      case "complete":
        return "Complete Resolution";
      case "document":
        return "Complete Documentation";
      default:
        return "Confirm Action";
    }
  };

  const getMainActionButton = () => {
    if (activeStep === "new" && anomaly.status === "NEW") {
      return (
        <Button
          onClick={handleMainAction}
          disabled={isActionLoading}
          className="w-full border px-6 py-4 rounded-lg font-medium transition-all duration-200"
          size="lg"
        >
          <CheckCircle className="h-5 w-5 mr-3" />
          {isActionLoading ? "Processing..." : "Validate Anomaly"}
        </Button>
      );
    }
    
    if (activeStep === "in-progress" && anomaly.status === "IN_PROGRESS") {
      return (
        <Button
          onClick={handleMainAction}
          disabled={isActionLoading}
          className="w-full border px-6 py-4 rounded-lg font-medium transition-all duration-200"
          size="lg"
        >
          <CheckCircle className="h-5 w-5 mr-3" />
          {isActionLoading ? "Processing..." : "Complete Resolution"}
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
          <CheckCircle className="h-5 w-5 mr-3" />
          {isActionLoading ? "Processing..." : "Complete Documentation"}
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
      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <div className="flex items-center mb-4">
              {/* <AlertTriangle className="h-6 w-6 text-orange-500 mr-3" /> */}
              <h3 className="text-lg font-semibold text-gray-900">{getConfirmationTitle()}</h3>
            </div>
            <p className="text-gray-600 mb-6">{getConfirmationMessage()}</p>
            <div className="flex space-x-3">
              <Button
                onClick={() => {
                  setShowConfirmModal(false);
                  setPendingAction(null);
                }}
                variant="outline"
                className="flex-1"
                disabled={isActionLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={executeConfirmedAction}
                className="flex-1"
                disabled={isActionLoading}
              >
                {isActionLoading ? "Processing..." : "Confirm"}
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
