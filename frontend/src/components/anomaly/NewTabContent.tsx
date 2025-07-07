"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { CollapsibleCard } from "@/components/ui/collapsible-card";
import { 
  Plus, 
  Minus,
  Settings, 
  Shield, 
  Activity,
  PlayCircle,
  Save,
  X
} from "lucide-react";
import { AnomalyWithRelations, ActionPlan, calculateCriticality, getCriticalityLevel } from "@/types/anomaly";

interface NewTabContentProps {
  anomaly: AnomalyWithRelations;
  onUpdate: (updates: Partial<AnomalyWithRelations>) => Promise<void>;
  onStatusChange: (newStatus: AnomalyWithRelations['status']) => Promise<void>;
}

export function NewTabContent({ anomaly, onUpdate, onStatusChange }: NewTabContentProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [isActionPlanModalOpen, setIsActionPlanModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    process_safety: anomaly.process_safety,
    fiabilite_integrite: anomaly.fiabilite_integrite,
    disponibilite: anomaly.disponibilite,
    duration_of_intervention: 0,
    requires_stopping: false
  });
  
  const currentCriticality = calculateCriticality(
    formData.process_safety,
    formData.fiabilite_integrite,
    formData.disponibilite
  );

  const criticalityLevel = getCriticalityLevel(currentCriticality);

  const handleFieldChange = (field: keyof typeof formData, value: number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (formData.process_safety < 1 || formData.process_safety > 5) return false;
    if (formData.fiabilite_integrite < 1 || formData.fiabilite_integrite > 5) return false;
    if (formData.disponibilite < 1 || formData.disponibilite > 5) return false;
    
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      alert("Please complete all required criticality fields.");
      return;
    }

    setIsSaving(true);
    try {
      await onUpdate({
        process_safety: formData.process_safety,
        fiabilite_integrite: formData.fiabilite_integrite,
        disponibilite: formData.disponibilite,
        criticality: currentCriticality,
      });
    } catch (error) {
      console.error("Failed to save anomaly data:", error);
      alert("Failed to save data. Please try again.");
    } finally {
      setIsSaving(false);
    }
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

  return (
    <div className="space-y-6">
      {/* Criticality Assessment & Intervention Details */}
      <CollapsibleCard
        title="Criticality Assessment & Intervention"
        icon={<Shield className="h-5 w-5" />}
        defaultOpen={true}
        className=""
      >
        <div className="space-y-5">
          {/* Criticality Controls */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            {/* Process Safety */}
            <div className="space-y-2">
              <Label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Process Safety</Label>
              <div className="flex items-center gap-2 p-2 rounded-lg border border-gray-200/60 bg-white">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleFieldChange('process_safety', Math.max(1, formData.process_safety - 1))}
                  disabled={formData.process_safety <= 1}
                  className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600 hover:bg-white/80"
                >
                  <Minus className="h-3 w-3" />
                </Button>
                
                <div className="flex-1 text-center">
                  <span className="text-base font-semibold text-gray-900">{formData.process_safety}</span>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleFieldChange('process_safety', Math.min(5, formData.process_safety + 1))}
                  disabled={formData.process_safety >= 5}
                  className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600 hover:bg-white/80"
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </div>
            
            {/* Reliability & Integrity */}
            <div className="space-y-2">
              <Label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Reliability</Label>
              <div className="flex items-center gap-2 p-2 rounded-lg border border-gray-200/60 bg-white">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleFieldChange('fiabilite_integrite', Math.max(1, formData.fiabilite_integrite - 1))}
                  disabled={formData.fiabilite_integrite <= 1}
                  className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600 hover:bg-white/80"
                >
                  <Minus className="h-3 w-3" />
                </Button>
                
                <div className="flex-1 text-center">
                  <span className="text-base font-semibold text-gray-900">{formData.fiabilite_integrite}</span>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleFieldChange('fiabilite_integrite', Math.min(5, formData.fiabilite_integrite + 1))}
                  disabled={formData.fiabilite_integrite >= 5}
                  className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600 hover:bg-white/80"
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </div>
            
            {/* Availability */}
            <div className="space-y-2">
              <Label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Availability</Label>
              <div className="flex items-center gap-2 p-2 rounded-lg border border-gray-200/60 bg-white">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleFieldChange('disponibilite', Math.max(1, formData.disponibilite - 1))}
                  disabled={formData.disponibilite <= 1}
                  className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600 hover:bg-white/80"
                >
                  <Minus className="h-3 w-3" />
                </Button>
                
                <div className="flex-1 text-center">
                  <span className="text-base font-semibold text-gray-900">{formData.disponibilite}</span>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleFieldChange('disponibilite', Math.min(5, formData.disponibilite + 1))}
                  disabled={formData.disponibilite >= 5}
                  className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600 hover:bg-white/80"
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>

          {/* Summary Row - Criticality Score + Intervention Details */}
          <div className="flex flex-row-reverse items-center justify-between p-4 rounded-xl border border-gray-200/60 shadow-sm bg-white">
            {/* Criticality Result */}
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Total Score</div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-gray-900">{currentCriticality}</span>
                  <span className="text-sm text-gray-400">/15</span>
                  <Badge className={getCriticalityColor(criticalityLevel)} variant="outline">
                    {criticalityLevel}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Intervention Details */}
            <div className="flex items-center gap-6">
              {/* Duration */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">Duration</span>
                <div className="flex items-center gap-1 px-2 py-1 bg-white rounded-md border border-gray-200 shadow-sm">
                  <Input
                    type="text"
                    value={formData.duration_of_intervention || ''}
                    onChange={(e) => handleFieldChange('duration_of_intervention', parseFloat(e.target.value) || 0)}
                    placeholder="0"
                    className="text-center border-0 bg-transparent text-sm w-8 focus:ring-0 p-0 font-medium"
                  />
                  <span className="text-xs text-gray-400">h</span>
                </div>
              </div>
              
              {/* Requires Stopping */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">Requires Stopping</span>
                <Switch
                  checked={formData.requires_stopping}
                  onCheckedChange={(checked) => handleFieldChange('requires_stopping', checked)}
                  className="data-[state=checked]:bg-blue-600 scale-90"
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-4">
            <Button
              onClick={handleSave}
              disabled={!validateForm() || isSaving}
              variant="outline"
              className="px-4 py-2 text-gray-900 border-gray-400 hover:bg-gray-100"
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </CollapsibleCard>

      {/* Action Plan */}
      <CollapsibleCard
        title="Action Plan"
        icon={<Activity className="h-5 w-5" />}
        defaultOpen={true}
        className=""
      >
        <div className="flex items-center justify-center py-8">
          <Button
            variant="outline"
            onClick={() => setIsActionPlanModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Action Plan
          </Button>
        </div>
      </CollapsibleCard>

      {/* Action Plan Modal */}
      {isActionPlanModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsActionPlanModalOpen(false)}
          />
          
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 rounded-t-2xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Action Plan</h2>
                  <p className="text-sm text-gray-600 mt-1">Define actions needed to resolve this anomaly</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsActionPlanModalOpen(false)}
                  className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="p-6">
              <div className="text-center py-12 text-gray-500">
                <Activity className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <p className="text-lg font-medium text-gray-900 mb-2">Coming Soon</p>
                <p className="text-sm">Action plan functionality will be available here</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 