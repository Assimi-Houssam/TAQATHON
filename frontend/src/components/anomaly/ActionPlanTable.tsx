"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Plus,
  Edit3,
  Trash2,
  User,
  Activity,
  X,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Loader2
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { 
  ActionPlanItem, 
  ActionPlanFormData,
  ActionPlanStatus,
  actionPlanToItem
} from "@/types/action-plan";
import { useActionPlans, useActionPlanMutations } from "@/hooks/useActionPlans";

interface ActionPlanTableProps {
  title?: string;
  showHeader?: boolean;
  collapsible?: boolean;
  defaultOpen?: boolean;
  className?: string;
  anomalyId?: string; // For server-side data management
  onAddAction?: () => void;
  onEditAction?: (item: ActionPlanItem) => void;
  onDeleteAction?: (id: string) => void;
  items?: ActionPlanItem[]; // For local/fallback data
}

export function ActionPlanTable({ 
  title = "Action Plan",
  showHeader = true,
  collapsible = false,
  defaultOpen = true,
  className = "",
  anomalyId,
  onAddAction,
  onEditAction,
  onDeleteAction,
  items = []
}: ActionPlanTableProps) {
  // Server-side data management when anomalyId is provided
  const { 
    data: actionPlansData, 
    isLoading: isLoadingActionPlans, 
    error: actionPlansError 
  } = useActionPlans({ 
    anomalyId, 
    enabled: !!anomalyId 
  });

  const {
    createActionPlan,
    deleteActionPlan,
    updateActionPlanFromItem,
    toggleActionPlanStatus
  } = useActionPlanMutations();

  // Local state management for fallback or when no anomalyId
  const [localActionPlanItems, setLocalActionPlanItems] = useState<ActionPlanItem[]>(items);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [formData, setFormData] = useState<ActionPlanFormData>({
    action: '',
    responsible: '',
    pdrsAvailable: false,
    internalResources: '',
    externalResources: '',
    isDone: false
  });

  // Determine which data source to use
  const actionPlanItems = anomalyId 
    ? actionPlansData?.actionPlanItems || [] 
    : localActionPlanItems;

  const isDataLoading = anomalyId ? isLoadingActionPlans : isLoading;

  // Update local items when props change (for local mode)
  useEffect(() => {
    if (!anomalyId) {
      setLocalActionPlanItems(items);
    }
  }, [items, anomalyId]);

  const getStatusBadge = (isDone: boolean) => {
    return isDone ? (
      <Badge className="bg-green-100 text-green-800 border-green-300">
        <CheckCircle2 className="h-3 w-3 mr-1" />
        Done
      </Badge>
    ) : (
      <Badge variant="secondary" className="bg-gray-100 text-gray-700 border-gray-300">
        Pending
      </Badge>
    );
  };

  const handleAddAction = () => {
    setIsAddModalOpen(true);
  };

  const handleEditAction = (item: ActionPlanItem) => {
    if (onEditAction) {
      onEditAction(item);
    }
  };

  const handleDeleteAction = async (id: string) => {
    if (onDeleteAction) {
      onDeleteAction(id);
      return;
    }

    if (anomalyId) {
      // Server-side deletion
      try {
        await deleteActionPlan.mutateAsync(id);
        toast.success('Action deleted successfully');
      } catch (error) {
        console.error('Failed to delete action:', error);
        toast.error('Failed to delete action');
      }
    } else {
      // Local deletion
      setLocalActionPlanItems(prev => prev.filter(item => item.id !== id));
    }
  };

  const handleToggleComplete = async (id: string) => {
    if (anomalyId) {
      // Server-side toggle
      const item = actionPlanItems.find(item => item.id === id);
      if (!item) return;

      try {
        const updatedItem = { ...item, isDone: !item.isDone };
        await updateActionPlanFromItem.mutateAsync({ 
          id, 
          item: updatedItem, 
          anomalyId 
        });
        toast.success('Action status updated successfully');
      } catch (error) {
        console.error('Failed to update action status:', error);
        toast.error('Failed to update action status');
      }
    } else {
      // Local toggle
      setLocalActionPlanItems(prev => 
        prev.map(item => 
          item.id === id 
            ? { ...item, isDone: !item.isDone }
            : item
        )
      );
    }
  };

  const resetForm = () => {
    setFormData({
      action: '',
      responsible: '',
      pdrsAvailable: false,
      internalResources: '',
      externalResources: '',
      isDone: false
    });
  };

  const handleCloseModal = () => {
    setIsAddModalOpen(false);
    resetForm();
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.action.trim() || !formData.responsible.trim()) {
      toast.error('Please fill in the required fields (Action and Responsible).');
      return;
    }

    setIsLoading(true);
    
    try {
      if (anomalyId) {
        // Server-side creation
        await createActionPlan.mutateAsync({
          anomalyId,
          data: formData
        });
        toast.success('Action plan created successfully');
      } else {
        // Local creation
        const newItem: ActionPlanItem = {
          id: `action-${Date.now()}`,
          action: formData.action.trim(),
          responsible: formData.responsible.trim(),
          pdrsAvailable: formData.pdrsAvailable || false,
          internalResources: formData.internalResources?.trim() || '',
          externalResources: formData.externalResources?.trim() || '',
          isDone: formData.isDone || false
        };

        setLocalActionPlanItems(prev => [...prev, newItem]);
      }
      
      // Auto-open the collapsible section when adding an action
      if (collapsible && !isOpen) {
        setIsOpen(true);
      }
      
      handleCloseModal();
    } catch (error) {
      console.error('Failed to add action:', error);
      toast.error('Failed to add action. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFieldChange = (field: keyof ActionPlanFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <>
      <Card className={`shadow-sm ${className}`}>
        {showHeader && (
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Activity className="h-5 w-5 text-blue-600" />
                <CardTitle className="text-lg font-semibold">{title}</CardTitle>
              </div>
              <div className="flex items-center gap-3">
                <Button 
                  size="sm" 
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={handleAddAction}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Action
                </Button>
                {collapsible && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsOpen(!isOpen)}
                    className="h-9 px-3 hover:bg-gray-100 border-gray-300 shadow-sm"
                  >
                    <span className="text-xs font-medium mr-2 text-gray-700">
                      {isOpen ? 'Collapse' : 'Expand'}
                    </span>
                    {isOpen ? (
                      <ChevronUp className="h-4 w-4 text-gray-600" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-gray-600" />
                    )}
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
        )}
        {(!collapsible || isOpen) && (
          <CardContent className="p-0 animate-in slide-in-from-top-2 duration-200">
            <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left py-3 px-4 font-medium text-gray-900 text-sm">Action</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 text-sm">Responsable</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 text-sm">PDRs disponible</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 text-sm">Ressources Internes</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 text-sm">Ressources externes</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 text-sm">Statut</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 text-sm w-24">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isDataLoading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12">
                      <div className="flex flex-col items-center gap-3">
                        <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
                        <p className="text-sm text-gray-500">Loading action plans...</p>
                      </div>
                    </td>
                  </tr>
                ) : actionPlanItems.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12">
                      <div className="flex flex-col items-center gap-3">
                        <Activity className="h-12 w-12 text-gray-300" />
                        <div>
                          <h3 className="text-sm font-medium text-gray-900 mb-1">No action plan items</h3>
                          <p className="text-sm text-gray-500">Get started by adding your first action item.</p>
                        </div>
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="mt-2"
                          onClick={handleAddAction}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Action
                        </Button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  actionPlanItems.map((item, index) => (
                    <tr key={item.id} className={`border-b border-gray-100 hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}>
                      <td className="py-3 px-4 text-sm text-gray-900">{item.action || '-'}</td>
                      <td className="py-3 px-4 text-sm text-gray-700">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400" />
                          {item.responsible || '-'}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-700">{item.pdrsAvailable ? "Yes" : "No"}</td>
                      <td className="py-3 px-4 text-sm text-gray-700">{item.internalResources || '-'}</td>
                      <td className="py-3 px-4 text-sm text-gray-700">{item.externalResources || '-'}</td>
                      <td className="py-3 px-4">{getStatusBadge(item.isDone)}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Checkbox
                            checked={item.isDone}
                            onCheckedChange={() => handleToggleComplete(item.id)}
                            className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                            disabled={isDataLoading}
                          />
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                            onClick={() => handleDeleteAction(item.id)}
                            disabled={isDataLoading}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Add Action Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-900">Add New Action</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleFormSubmit} className="space-y-4 pt-4">
            {/* Action Description */}
            <div className="space-y-2">
              <Label htmlFor="action" className="text-sm font-medium text-gray-700">
                Action Description *
              </Label>
              <Textarea
                id="action"
                value={formData.action}
                onChange={(e) => handleFieldChange('action', e.target.value)}
                placeholder="Describe what needs to be done..."
                rows={3}
                className="resize-none"
                required
              />
            </div>

            {/* Responsible Person */}
            <div className="space-y-2">
              <Label htmlFor="responsible" className="text-sm font-medium text-gray-700">
                Responsible Person/Team *
              </Label>
              <Input
                id="responsible"
                value={formData.responsible}
                onChange={(e) => handleFieldChange('responsible', e.target.value)}
                placeholder="Who will execute this action?"
                required
              />
            </div>

            {/* Toggles Grid */}
            <div className="grid grid-cols-2 gap-4">
              {/* PDRs Available Toggle */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div>
                  <Label htmlFor="pdrsAvailable" className="text-sm font-medium text-gray-700">
                    PDRs Available
                  </Label>
                  <p className="text-xs text-gray-500">Are PDRs available?</p>
                </div>
                <Switch
                  id="pdrsAvailable"
                  checked={formData.pdrsAvailable}
                  onCheckedChange={(checked) => handleFieldChange('pdrsAvailable', checked)}
                  className="data-[state=checked]:bg-blue-600"
                />
              </div>

              {/* Done Toggle */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div>
                  <Label htmlFor="isDone" className="text-sm font-medium text-gray-700">
                    Mark as Done
                  </Label>
                  <p className="text-xs text-gray-500">Already completed?</p>
                </div>
                <Switch
                  id="isDone"
                  checked={formData.isDone}
                  onCheckedChange={(checked) => handleFieldChange('isDone', checked)}
                  className="data-[state=checked]:bg-green-600"
                />
              </div>
            </div>

            {/* Resources Section */}
            <div className="space-y-3 pt-2">
              <h4 className="text-sm font-medium text-gray-700 border-b border-gray-200 pb-2">
                Resources (Optional)
              </h4>
              
              <div className="grid grid-cols-1 gap-3">
                {/* Internal Resources */}
                <div className="space-y-2">
                  <Label htmlFor="internal" className="text-sm text-gray-600">
                    Internal Resources
                  </Label>
                  <Textarea
                    id="internal"
                    value={formData.internalResources}
                    onChange={(e) => handleFieldChange('internalResources', e.target.value)}
                    placeholder="Internal resources needed..."
                    rows={2}
                    className="resize-none"
                  />
                </div>

                {/* External Resources */}
                <div className="space-y-2">
                  <Label htmlFor="external" className="text-sm text-gray-600">
                    External Resources
                  </Label>
                  <Textarea
                    id="external"
                    value={formData.externalResources}
                    onChange={(e) => handleFieldChange('externalResources', e.target.value)}
                    placeholder="External resources needed..."
                    rows={2}
                    className="resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseModal}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white"
                disabled={isLoading || !formData.action.trim() || !formData.responsible.trim()}
              >
                {isLoading ? "Adding..." : "Add Action"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
} 