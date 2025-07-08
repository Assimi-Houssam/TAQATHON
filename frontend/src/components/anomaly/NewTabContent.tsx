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
  Send
} from "lucide-react";
import { AnomalyWithRelations, ActionPlan, calculateCriticalityFromStrings, getCriticalityLevel } from "@/types/anomaly";
import { ActionPlanTable } from "./ActionPlanTable";

interface NewTabContentProps {
  anomaly: AnomalyWithRelations;
  onUpdate: (updates: Partial<AnomalyWithRelations>) => Promise<void>;
  onStatusChange: (newStatus: AnomalyWithRelations['status']) => Promise<void>;
}

export function NewTabContent({ anomaly, onUpdate, onStatusChange }: NewTabContentProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [criteriaTouched, setCriteriaTouched] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [formData, setFormData] = useState({
    process_safty: parseFloat(anomaly.process_safty || '1') || 1,
    fiablite_integrite: parseFloat(anomaly.fiablite_integrite || '1') || 1,
    disponsibilite: parseFloat(anomaly.disponsibilite || '1') || 1,
    duration_of_intervention: 0,
    requires_stopping: false
  });
  
  const currentCriticality = calculateCriticalityFromStrings(
    formData.fiablite_integrite.toString(),
    formData.disponsibilite.toString(),
    formData.process_safty.toString()
  );

  const criticalityLevel = getCriticalityLevel(currentCriticality.toString());

  const validateForm = () => {
    if (formData.process_safty < 1 || formData.process_safty > 5) return false;
    if (formData.fiablite_integrite < 1 || formData.fiablite_integrite > 5) return false;
    if (formData.disponsibilite < 1 || formData.disponsibilite > 5) return false;
    
    return true;
  };

  const handleFieldChange = async (field: keyof typeof formData, value: number | boolean) => {
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);

    // Mark criteria as touched if it's one of the 3 criteria fields
    if (field === 'process_safty' || field === 'fiablite_integrite' || field === 'disponsibilite') {
      setCriteriaTouched(true);
    }

    // Auto-save for criteria fields
    if ((field === 'process_safty' || field === 'fiablite_integrite' || field === 'disponsibilite') && validateForm()) {
      setIsUpdating(true);
      try {
        const newCriticality = calculateCriticalityFromStrings(
          (field === 'fiablite_integrite' ? value as number : newFormData.fiablite_integrite).toString(),
          (field === 'disponsibilite' ? value as number : newFormData.disponsibilite).toString(),
          (field === 'process_safty' ? value as number : newFormData.process_safty).toString()
        );
        
        await onUpdate({
          [field]: field === 'process_safty' ? (value as number).toString() : 
                   field === 'fiablite_integrite' ? (value as number).toString() :
                   field === 'disponsibilite' ? (value as number).toString() : value,
          Criticite: newCriticality.toString(),
        });
      } catch (error) {
        console.error("Failed to update anomaly data:", error);
      } finally {
        setIsUpdating(false);
      }
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
                  onClick={() => handleFieldChange('process_safty', Math.max(1, formData.process_safty - 1))}
                  disabled={formData.process_safty <= 1 || isUpdating}
                  className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600 hover:bg-white/80"
                >
                  <Minus className="h-3 w-3" />
                </Button>
                
                <div className="flex-1 text-center">
                  <span className="text-base font-semibold text-gray-900">{formData.process_safty}</span>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleFieldChange('process_safty', Math.min(5, formData.process_safty + 1))}
                  disabled={formData.process_safty >= 5 || isUpdating}
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
                  onClick={() => handleFieldChange('fiablite_integrite', Math.max(1, formData.fiablite_integrite - 1))}
                  disabled={formData.fiablite_integrite <= 1 || isUpdating}
                  className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600 hover:bg-white/80"
                >
                  <Minus className="h-3 w-3" />
                </Button>
                
                <div className="flex-1 text-center">
                  <span className="text-base font-semibold text-gray-900">{formData.fiablite_integrite}</span>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleFieldChange('fiablite_integrite', Math.min(5, formData.fiablite_integrite + 1))}
                  disabled={formData.fiablite_integrite >= 5 || isUpdating}
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
                  onClick={() => handleFieldChange('disponsibilite', Math.max(1, formData.disponsibilite - 1))}
                  disabled={formData.disponsibilite <= 1 || isUpdating}
                  className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600 hover:bg-white/80"
                >
                  <Minus className="h-3 w-3" />
                </Button>
                
                <div className="flex-1 text-center">
                  <span className="text-base font-semibold text-gray-900">{formData.disponsibilite}</span>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleFieldChange('disponsibilite', Math.min(5, formData.disponsibilite + 1))}
                  disabled={formData.disponsibilite >= 5 || isUpdating}
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
                  {isUpdating && (
                    <div className="ml-2 w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  )}
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
                    className="text-center border-0 bg-transparent text-sm w-16 focus:ring-0 p-0 font-medium"
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

          {/* Feedback Input - Appears smoothly when criteria are touched */}
          <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
            criteriaTouched 
              ? 'max-h-[250px] opacity-100 translate-y-0' 
              : 'max-h-0 opacity-0 -translate-y-2'
          }`}>
            <div className="space-y-3 pt-4 pb-2 border-t border-gray-100">
              <Label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                Feedback on Criticality Assessment
              </Label>
              <Textarea
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="Enter your feedback on the criticality assessment..."
                className="min-h-[80px] border-gray-200 focus:border-blue-400 focus:ring-blue-400/20"
                rows={2}
              />
              <div className="flex justify-between items-center pt-1">
                <p className="text-xs text-gray-500">
                  This feedback will help improve future criticality assessments.
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  className="px-3 py-1 h-8 text-xs border-gray-300 hover:bg-gray-50 flex-shrink-0"
                >
                  <Send className="h-3 w-3 mr-1" />
                  Send
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CollapsibleCard>

      {/* Action Plan */}
      <ActionPlanTable 
        showHeader={true} 
        collapsible={true} 
        defaultOpen={false} 
      />
    </div>
  );
} 