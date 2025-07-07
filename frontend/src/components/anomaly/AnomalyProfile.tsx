"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Circle, PlayCircle, Save } from "lucide-react";
import { AnomalyWithRelations, STATUS_TRANSITIONS } from "@/types/anomaly";
import { AnomalySummary } from "./AnomalySummary";
import { NewTabContent } from "./NewTabContent";
import { InProgressTabContent } from "./InProgressTabContent";
import { ClosedTabContent } from "./ClosedTabContent";

interface AnomalyProfileProps {
  anomaly: AnomalyWithRelations;
  onStatusChange?: (newStatus: AnomalyWithRelations['status']) => Promise<void>;
  onUpdate?: (updates: Partial<AnomalyWithRelations>) => Promise<void>;
}

const LIFECYCLE_STEPS = [
  { key: "new", label: "New", description: "Configure anomaly", status: "New" },
  { key: "in-progress", label: "In Progress", description: "Execute maintenance", status: "In Progress" },
  { key: "closed", label: "Closed", description: "Document resolution", status: "Closed" }
];

export function AnomalyProfile({ anomaly, onStatusChange, onUpdate }: AnomalyProfileProps) {
  const [activeStep, setActiveStep] = useState(() => {
    switch (anomaly.status) {
      case "New": return "new";
      case "In Progress": return "in-progress"; 
      case "Closed": return "closed";
      default: return "new";
    }
  });
  
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [rexSaveFunction, setRexSaveFunction] = useState<(() => Promise<void>) | null>(null);

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
      case "new": return anomaly.status === "New";
      case "in-progress": return anomaly.status === "In Progress" || anomaly.status === "Closed";
      case "closed": return anomaly.status === "Closed";
      default: return false;
    }
  };

  const handleStatusTransition = async (newStatus: AnomalyWithRelations['status']) => {
    if (!STATUS_TRANSITIONS[anomaly.status].includes(newStatus) || !onStatusChange) return;
    
    try {
      await onStatusChange(newStatus);
      if (newStatus === "In Progress") {
        setActiveStep("in-progress");
      } else if (newStatus === "Closed") {
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

  const handleMainAction = async () => {
    setIsActionLoading(true);
    try {
      if (activeStep === "new" && anomaly.status === "New") {
        await handleStatusTransition("In Progress");
      } else if (activeStep === "in-progress" && anomaly.status === "In Progress") {
        await handleStatusTransition("Closed");
      } else if (activeStep === "closed" && anomaly.status === "Closed" && rexSaveFunction) {
        await rexSaveFunction();
      }
    } catch (error) {
      console.error("Failed to execute main action:", error);
    } finally {
      setIsActionLoading(false);
    }
  };

  const getMainActionButton = () => {
    if (activeStep === "new" && anomaly.status === "New") {
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
    
    if (activeStep === "in-progress" && anomaly.status === "In Progress") {
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
    
    if (activeStep === "closed" && anomaly.status === "Closed") {
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
        return anomaly.status === "New" && onStatusChange && onUpdate ? (
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
        return (anomaly.status === "In Progress" || anomaly.status === "Closed") && onStatusChange && onUpdate ? (
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
        return anomaly.status === "Closed" && onUpdate ? (
          <ClosedTabContent 
            anomaly={anomaly} 
            onUpdate={handleUpdate}
            onSetRexSaveFunction={setRexSaveFunction}
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
      {/* Main Action Button - Top */}
      {/* <div className="mb-6 flex justify-center">
        {getMainActionButton()}
      </div> */}

      {/* Clean Progress Stepper */}
      <div className="z-20 mb-6 p-4 bg-white/95 backdrop-blur-md rounded-lg border border-gray-200 shadow">
        <div className="relative">
          {/* Subtle Background Accent */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 to-blue-50/50 rounded-lg"></div>
          
          <div className="relative flex items-center justify-between">
            {LIFECYCLE_STEPS.map((step, index) => {
              const status = getStepStatus(step.key);
              const isClickable = canAccessStep(step.key);
              const progress = ((getCurrentStepIndex() + 1) / LIFECYCLE_STEPS.length) * 100;
              
              return (
                <div key={step.key} className="flex items-center flex-1">
                  {/* Step Node */}
                  <div className="relative flex items-center">
                    <button
                      onClick={() => isClickable && setActiveStep(step.key)}
                      disabled={!isClickable}
                      className={`
                        relative flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300 transform border-2
                        ${status === "completed" 
                          ? "bg-blue-600 border-blue-600 shadow-md shadow-blue-200 scale-110" 
                          : status === "current"
                          ? "bg-blue-500 border-blue-500 shadow-lg shadow-blue-300 scale-125"
                          : "bg-white border-gray-300 hover:border-blue-300"
                        }
                        ${isClickable ? "hover:scale-110 cursor-pointer" : "cursor-not-allowed"}
                      `}
                    >
                      {status === "completed" && (
                        <CheckCircle className="h-4 w-4 text-white" />
                      )}
                      {status === "current" && (
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      )}
                      {status === "pending" && (
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                      )}
                      
                      {/* Subtle Hover Effect */}
                      {isClickable && (
                        <div className="absolute inset-0 rounded-full bg-blue-500 opacity-0 hover:opacity-10 transition-opacity duration-300"></div>
                      )}
                    </button>
                    
                    {/* Step Label - Only for current step */}
                    {status === "current" && (
                      <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
                        <div className="bg-white text-gray-700 text-xs px-2 py-1 rounded-md border border-gray-200 shadow-sm whitespace-nowrap">
                          {step.label}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Progress Line */}
                  {index < LIFECYCLE_STEPS.length - 1 && (
                    <div className="flex-1 mx-3 h-0.5 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-700 ease-in-out ${
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
            <div className="absolute -top-2 -right-2">
              <div className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-medium shadow-sm">
                {Math.round(((getCurrentStepIndex() + 1) / LIFECYCLE_STEPS.length) * 100)}%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Main Content - Left Side */}
        <div className="xl:col-span-3 order-2 xl:order-1">
          <Card className="shadow-sm border-none shadow-none">
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
