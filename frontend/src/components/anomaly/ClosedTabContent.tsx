"use client";

import React, { useState, useCallback, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CollapsibleCard } from "@/components/ui/collapsible-card";
import { 
  CheckCircle,
  Calendar,
  Clock,
  Users,
  Activity,
  FileText,
  Shield,
  Save
} from "lucide-react";
import { AnomalyWithRelations, getCriticalityLevel } from "@/types/anomaly";

interface ClosedTabContentProps {
  anomaly: AnomalyWithRelations;
  onUpdate: (updates: Partial<AnomalyWithRelations>) => Promise<void>;
  onSetRexSaveFunction?: (saveFunction: (() => Promise<void>) | null) => void;
}

export function ClosedTabContent({ anomaly, onUpdate, onSetRexSaveFunction }: ClosedTabContentProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [rexNotes, setRexNotes] = useState(anomaly.rex?.notes || "");
  const [lessonsLearned, setLessonsLearned] = useState(anomaly.rex?.lessons_learned || "");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const saveInProgressRef = useRef(false);

  const criticalityLevel = getCriticalityLevel(anomaly.criticality);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setHasUnsavedChanges(true);
    }
  };

  const handleNotesChange = (value: string) => {
    setRexNotes(value);
    setHasUnsavedChanges(true);
  };

  const handleLessonsChange = (value: string) => {
    setLessonsLearned(value);
    setHasUnsavedChanges(true);
  };

  const handleSaveREX = useCallback(async () => {
    // Prevent duplicate saves
    if (saveInProgressRef.current || isLoading) {
      return;
    }

    if (!rexNotes.trim()) {
      alert("Please provide REX notes before saving.");
      return;
    }

    saveInProgressRef.current = true;
    setIsLoading(true);
    
    try {
      await onUpdate({
        rex: {
          id: anomaly.rex?.id || `rex-${anomaly.id}`,
          anomaly_id: anomaly.id,
          notes: rexNotes,
          lessons_learned: lessonsLearned,
          created_by: "current-user",
          created_at: new Date().toISOString(),
          file_path: selectedFile ? `/uploads/rex/${selectedFile.name}` : anomaly.rex?.file_path
        }
      });
      
      setHasUnsavedChanges(false);
      alert("REX data saved successfully!");
    } catch (error) {
      console.error("Failed to save REX:", error);
      alert("Failed to save REX data. Please try again.");
    } finally {
      setIsLoading(false);
      saveInProgressRef.current = false;
    }
  }, [rexNotes, lessonsLearned, selectedFile, onUpdate, anomaly.rex?.id, anomaly.id, anomaly.rex?.file_path, isLoading]);

  // Only set the save function when there are actual changes and notes are provided
  React.useEffect(() => {
    if (onSetRexSaveFunction) {
      if (hasUnsavedChanges && rexNotes.trim()) {
        onSetRexSaveFunction(handleSaveREX);
      } else {
        onSetRexSaveFunction(null);
      }
    }
    
    // Cleanup: remove the save function when component unmounts
    return () => {
      if (onSetRexSaveFunction) {
        onSetRexSaveFunction(null);
      }
    };
  }, [handleSaveREX, onSetRexSaveFunction, hasUnsavedChanges, rexNotes]);

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getCriticalityColor = (level: string) => {
    switch (level) {
      case 'LOW': return 'bg-green-50 text-green-700 border-green-200';
      case 'MEDIUM': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'HIGH': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'CRITICAL': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusBadge = (requires_stopping?: boolean) => {
    if (requires_stopping === undefined) return null;
    
    return (
      <Badge variant={requires_stopping ? "destructive" : "secondary"}>
        {requires_stopping ? "Required Stopping" : "No Stopping Required"}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Closure Summary */}
      <CollapsibleCard
        title="Resolution Summary"
        icon={<CheckCircle className="h-5 w-5 text-green-600" />}
        defaultOpen={true}
      >
        <div className="flex items-center justify-center p-6 bg-green-50 rounded-lg border border-green-200">
          <div className="text-center">
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-green-900 mb-1">Anomaly Resolved</h3>
            <p className="text-sm text-green-700">
              Successfully closed on {anomaly.closed_at ? formatDateTime(anomaly.closed_at) : "N/A"}
            </p>
            <Badge className="mt-2 bg-green-100 text-green-800 border-green-300">
              Resolution Complete
            </Badge>
          </div>
        </div>
      </CollapsibleCard>

      {/* Final Criticality Assessment */}
      <CollapsibleCard
        title="Final Criticality Assessment"
        icon={<Shield className="h-5 w-5" />}
        defaultOpen={true}
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 border border-gray-200 rounded-lg bg-gray-50">
            <div className="text-2xl font-bold text-gray-900 mb-1">{anomaly.process_safety}</div>
            <div className="text-xs text-gray-500 mb-1">out of 5</div>
            <h4 className="text-sm font-medium text-gray-900">Process Safety</h4>
          </div>
          
          <div className="text-center p-4 border border-gray-200 rounded-lg bg-gray-50">
            <div className="text-2xl font-bold text-gray-900 mb-1">{anomaly.fiabilite_integrite}</div>
            <div className="text-xs text-gray-500 mb-1">out of 5</div>
            <h4 className="text-sm font-medium text-gray-900">Reliability</h4>
          </div>
          
          <div className="text-center p-4 border border-gray-200 rounded-lg bg-gray-50">
            <div className="text-2xl font-bold text-gray-900 mb-1">{anomaly.disponibilite}</div>
            <div className="text-xs text-gray-500 mb-1">out of 5</div>
            <h4 className="text-sm font-medium text-gray-900">Availability</h4>
          </div>
          
          <div className="text-center p-4 border border-gray-200 rounded-lg bg-blue-50 border-blue-200">
            <div className="text-2xl font-bold text-blue-900 mb-1">{anomaly.criticality}</div>
            <div className="text-xs text-blue-600 mb-1">out of 15</div>
            <h4 className="text-sm font-medium text-blue-900">Total Score</h4>
            <Badge className={getCriticalityColor(criticalityLevel)} variant="outline">
              {criticalityLevel}
            </Badge>
          </div>
        </div>
      </CollapsibleCard>

      {/* Maintenance Summary */}
      <CollapsibleCard
        title="Maintenance Summary"
        icon={<Calendar className="h-5 w-5" />}
        defaultOpen={false}
      >
        {anomaly.maintenance_window ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Execution Period
                </h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-600">Started:</span>
                    <span className="ml-2 font-medium">{formatDateTime(anomaly.maintenance_window.scheduled_start)}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Completed:</span>
                    <span className="ml-2 font-medium">{formatDateTime(anomaly.maintenance_window.scheduled_end)}</span>
                  </div>
                </div>
              </div>
              
              <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Execution Team
                </h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-600">Team:</span>
                    <span className="ml-2 font-medium">{anomaly.maintenance_window.assigned_team || "Not specified"}</span>
                  </div>
                  {anomaly.maintenance_window.duration_of_intervention && (
                    <div>
                      <span className="text-gray-600">Duration:</span>
                      <span className="ml-2 font-medium">{anomaly.maintenance_window.duration_of_intervention} hours</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {getStatusBadge(anomaly.maintenance_window.requires_stopping)}
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                ✓ Completed
              </Badge>
            </div>
          </div>
        ) : (
          <p className="text-gray-600 text-center py-4">No maintenance window data available.</p>
        )}
      </CollapsibleCard>

      {/* Action Plan Results */}
      <CollapsibleCard
        title="Action Plan Results"
        icon={<Activity className="h-5 w-5" />}
        defaultOpen={false}
      >
        {anomaly.action_plans && anomaly.action_plans.length > 0 ? (
          <div className="space-y-3">
            {anomaly.action_plans.map((plan, index) => (
              <div key={plan.id} className="flex items-start gap-3 p-3 border border-green-200 rounded-lg bg-green-50">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-green-900 mb-1">{plan.title}</h4>
                  <p className="text-sm text-green-800 mb-2">{plan.description}</p>
                  {plan.file_link && (
                    <a 
                      href={plan.file_link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-green-700 hover:text-green-900 text-xs underline inline-flex items-center gap-1"
                    >
                      📎 View documentation
                    </a>
                  )}
                </div>
                <Badge variant="outline" className="text-xs bg-white border-green-300 text-green-700">
                  Executed
                </Badge>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600 text-center py-4">No action plans were recorded.</p>
        )}
      </CollapsibleCard>

      {/* REX Documentation */}
      <CollapsibleCard
        title="Return of Experience (REX)"
        icon={<FileText className="h-5 w-5" />}
        defaultOpen={true}
      >
        <div className="space-y-6">
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-2">
              <FileText className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-900 mb-1">Document Your Experience</h4>
                <p className="text-sm text-yellow-800">
                  Share insights and lessons learned to help prevent similar issues in the future.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="rex-notes" className="text-sm font-medium">
                REX Notes *
              </Label>
              <Textarea
                id="rex-notes"
                value={rexNotes}
                onChange={(e) => handleNotesChange(e.target.value)}
                placeholder="Document the resolution process, what was done, and any important observations..."
                rows={4}
                className="min-h-[100px]"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="lessons-learned" className="text-sm font-medium">
                Lessons Learned
              </Label>
              <Textarea
                id="lessons-learned"
                value={lessonsLearned}
                onChange={(e) => handleLessonsChange(e.target.value)}
                placeholder="What insights were gained? How can similar issues be prevented in the future?"
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="rex-file" className="text-sm font-medium">
                Supporting Documentation
              </Label>
              <div className="space-y-2">
                <Input
                  id="rex-file"
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.txt,.jpg,.png"
                  className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {selectedFile && (
                  <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 p-2 rounded border border-green-200">
                    <CheckCircle className="h-4 w-4" />
                    <span>Selected: {selectedFile.name}</span>
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500">
                Upload photos, reports, or other documentation related to the resolution
              </p>
            </div>

            {/* Manual Save Button */}
            <div className="flex justify-end pt-4">
              <Button
                onClick={handleSaveREX}
                disabled={!rexNotes.trim() || isLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? "Saving..." : "Save REX Documentation"}
              </Button>
            </div>

            {hasUnsavedChanges && (
              <div className="text-sm text-orange-600 bg-orange-50 p-2 rounded border border-orange-200">
                You have unsaved changes. Save your REX documentation to preserve your work.
              </div>
            )}

            {anomaly.rex?.file_path && (
              <div className="p-3 border border-blue-200 rounded-lg bg-blue-50">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">Existing Documentation</p>
                    <a 
                      href={anomaly.rex.file_path} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-700 hover:text-blue-900 text-sm underline"
                    >
                      View current REX documentation
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </CollapsibleCard>
    </div>
  );
} 