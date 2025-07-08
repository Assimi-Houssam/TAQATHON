"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { CollapsibleCard } from "@/components/ui/collapsible-card";
import { 
  Plus, 
  Minus,
  Settings, 
  Shield, 
  Activity,
  PlayCircle
} from "lucide-react";
import { toast } from "sonner";
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

  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [formData, setFormData] = useState({
    process_safty: parseFloat(anomaly.process_safty || '1') || 1,
    fiablite_integrite: parseFloat(anomaly.fiablite_integrite || '1') || 1,
    disponsibilite: parseFloat(anomaly.disponsibilite || '1') || 1,
    duree_intervention: anomaly.duree_intervention || '',
    required_stoping: anomaly.required_stoping || false
  });
  
  const currentCriticality = calculateCriticalityFromStrings(
    formData.fiablite_integrite.toString(),
    formData.disponsibilite.toString(),
    formData.process_safty.toString()
  );

  const criticalityLevel = getCriticalityLevel(currentCriticality.toString());

  // Cleanup debounce timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  const validateForm = () => {
    if (formData.process_safty < 1 || formData.process_safty > 5) return false;
    if (formData.fiablite_integrite < 1 || formData.fiablite_integrite > 5) return false;
    if (formData.disponsibilite < 1 || formData.disponsibilite > 5) return false;
    
    return true;
  };

  // Debounced save function for text inputs like duration
  const debouncedSave = useCallback((field: string, value: string) => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    debounceTimeoutRef.current = setTimeout(async () => {
      setIsUpdating(true);
      try {
        await onUpdate({
          [field]: value
        });
        toast.success('Duration updated successfully');
      } catch (error) {
        console.error(`Failed to update ${field}:`, error);
        toast.error('Failed to update duration');
      } finally {
        setIsUpdating(false);
      }
    }, 800); // 800ms delay
  }, [onUpdate]);

  const handleFieldChange = async (field: keyof typeof formData, value: number | boolean | string) => {
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);

    // Mark criteria as touched if it's one of the 3 criteria fields
    if (field === 'process_safty' || field === 'fiablite_integrite' || field === 'disponsibilite') {
      setCriteriaTouched(true);
    }

    // Handle duration field with debounced save (no loading state)
    if (field === 'duree_intervention') {
      debouncedSave('duree_intervention', value as string);
      return; // Exit early since we're using debounced save
    }

    // Auto-save functionality with improved UX for other fields
    setIsUpdating(true);
    try {
      let updatePayload: any = {};

      // Handle criticality fields - recalculate criticality when any of the 3 change
      if (field === 'process_safty' || field === 'fiablite_integrite' || field === 'disponsibilite') {
        if (!validateForm()) {
          throw new Error('Invalid field values. Values must be between 1 and 5.');
        }

        const newCriticality = calculateCriticalityFromStrings(
          (field === 'fiablite_integrite' ? value as number : newFormData.fiablite_integrite).toString(),
          (field === 'disponsibilite' ? value as number : newFormData.disponsibilite).toString(),
          (field === 'process_safty' ? value as number : newFormData.process_safty).toString()
        );
        
        updatePayload = {
          [field]: (value as number).toString(),
          criticite: newCriticality.toString(),
        };
      } 
      // Handle requires stopping field
      else if (field === 'required_stoping') {
        updatePayload = {
          required_stoping: value as boolean
        };
      }

      await onUpdate(updatePayload);
      
      // Show success message
      if (field === 'process_safty' || field === 'fiablite_integrite' || field === 'disponsibilite') {
        toast.success('Criticality assessment updated successfully');
      } else if (field === 'required_stoping') {
        toast.success('Stopping requirement updated successfully');
      }
      
    } catch (error) {
      console.error(`Failed to update ${field}:`, error);
      // Revert the form data on error
      setFormData(formData);
      // Show error message to user
      if (field === 'process_safty' || field === 'fiablite_integrite' || field === 'disponsibilite') {
        toast.error('Failed to update criticality assessment');
      } else if (field === 'required_stoping') {
        toast.error('Failed to update stopping requirement');
      }
    } finally {
      setIsUpdating(false);
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
                    value={formData.duree_intervention || ''}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, duree_intervention: e.target.value }));
                      debouncedSave('duree_intervention', e.target.value);
                    }}
                    placeholder="e.g., 2 hours"
                    className="text-center border-0 bg-transparent text-sm w-20 focus:ring-0 p-0 font-medium"
                  />
                </div>
              </div>
              
              {/* Requires Stopping */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">Requires Stopping</span>
                <div className="relative">
                  <Switch
                    checked={formData.required_stoping}
                    onCheckedChange={(checked) => handleFieldChange('required_stoping', checked)}
                    className="data-[state=checked]:bg-blue-600 scale-90"
                    disabled={isUpdating}
                  />
                  {isUpdating && (
                    <div className="absolute -right-6 top-1/2 transform -translate-y-1/2 w-3 h-3 border border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  )}
                </div>
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