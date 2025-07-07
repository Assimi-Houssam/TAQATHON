"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CollapsibleCard } from "@/components/ui/collapsible-card";
import { 
  Calendar,
  Clock,
  Users,
  Settings,
  Activity,
  CheckCircle,
  Edit3,
  AlertCircle
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AnomalyWithRelations } from "@/types/anomaly";

interface InProgressTabContentProps {
  anomaly: AnomalyWithRelations;
  onUpdate: (updates: Partial<AnomalyWithRelations>) => Promise<void>;
  onStatusChange: (newStatus: AnomalyWithRelations['status']) => Promise<void>;
}

// Mock teams for reassignment dropdown
const availableTeams = [
  { id: "maintenance-a", name: "Maintenance Team A" },
  { id: "maintenance-b", name: "Maintenance Team B" },
  { id: "electrical", name: "Electrical Team" },
  { id: "mechanical", name: "Mechanical Team" },
  { id: "instrumentation", name: "Instrumentation Team" }
];

export function InProgressTabContent({ anomaly, onUpdate, onStatusChange }: InProgressTabContentProps) {
  const [isReassignLoading, setIsReassignLoading] = useState(false);
  const [isReassignDialogOpen, setIsReassignDialogOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(anomaly.maintenance_window?.assigned_team || "");
  const [reassignNotes, setReassignNotes] = useState("");

  const handleReassignment = async () => {
    if (!selectedTeam) {
      alert("Please select a team to assign this anomaly to.");
      return;
    }

    setIsReassignLoading(true);
    try {
      // In a real app, this would update the maintenance window
      await onUpdate({
        maintenance_window: {
          ...anomaly.maintenance_window!,
          assigned_team: selectedTeam,
          notes: reassignNotes || anomaly.maintenance_window?.notes || ""
        }
      });
      
      setIsReassignDialogOpen(false);
      setReassignNotes("");
    } catch (error) {
      console.error("Failed to reassign anomaly:", error);
      alert("Failed to reassign anomaly. Please try again.");
    } finally {
      setIsReassignLoading(false);
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusBadge = (requires_stopping?: boolean) => {
    if (requires_stopping === undefined) return null;
    
    return (
      <Badge variant={requires_stopping ? "destructive" : "secondary"}>
        {requires_stopping ? "Requires Stopping" : "No Stopping Required"}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Current Status */}
      <CollapsibleCard
        title="Current Status"
        icon={<Settings className="h-5 w-5" />}
        defaultOpen={true}
      >
        <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse"></div>
            <div>
              <p className="font-medium text-blue-900">Work In Progress</p>
              <p className="text-sm text-blue-700">Maintenance activities are currently underway</p>
            </div>
          </div>
          <Badge variant="outline" className="bg-white border-blue-300 text-blue-700">
            Active
          </Badge>
        </div>
      </CollapsibleCard>

      {/* Maintenance Window */}
      <CollapsibleCard
        title="Maintenance Window"
        icon={<Calendar className="h-5 w-5" />}
        defaultOpen={true}
      >
        <div className="space-y-4">
          <div className="flex items-center justify-end">
            <Dialog open={isReassignDialogOpen} onOpenChange={setIsReassignDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Edit3 className="h-4 w-4 mr-2" />
                  Reassign Team
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Reassign Maintenance Team</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="team-select">Assign to Team</Label>
                    <Select value={selectedTeam} onValueChange={setSelectedTeam}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a team" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableTeams.map((team) => (
                          <SelectItem key={team.id} value={team.name}>
                            {team.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="reassign-notes">Notes (Optional)</Label>
                    <Textarea
                      id="reassign-notes"
                      value={reassignNotes}
                      onChange={(e) => setReassignNotes(e.target.value)}
                      placeholder="Additional notes for the reassignment..."
                      rows={3}
                    />
                  </div>
                  
                  <div className="flex justify-end gap-2 pt-4">
                    <Button 
                      variant="outline" 
                      onClick={() => setIsReassignDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleReassignment}
                      disabled={isReassignLoading || !selectedTeam}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {isReassignLoading ? "Reassigning..." : "Reassign"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {anomaly.maintenance_window ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3 p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <h4 className="font-medium text-gray-900 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Schedule
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-600">Start:</span>
                      <span className="ml-2 font-medium">{formatDateTime(anomaly.maintenance_window.scheduled_start)}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">End:</span>
                      <span className="ml-2 font-medium">{formatDateTime(anomaly.maintenance_window.scheduled_end)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3 p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <h4 className="font-medium text-gray-900 flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Assignment
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-600">Team:</span>
                      <span className="ml-2 font-medium">{anomaly.maintenance_window.assigned_team || "Not assigned"}</span>
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
              </div>
              
              {anomaly.maintenance_window.notes && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Notes</h4>
                  <p className="text-sm text-blue-800">{anomaly.maintenance_window.notes}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Maintenance Window</h3>
              <p className="text-gray-600">No maintenance window has been scheduled yet.</p>
            </div>
          )}
        </div>
      </CollapsibleCard>

      {/* Action Plan */}
      <CollapsibleCard
        title="Action Plan"
        icon={<Activity className="h-5 w-5" />}
        defaultOpen={false}
      >
        {anomaly.action_plans && anomaly.action_plans.length > 0 ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-600">
                Planned actions for resolving this anomaly
              </p>
              <Badge variant="outline" className="text-xs">
                Read-only
              </Badge>
            </div>
            
            {anomaly.action_plans.map((plan, index) => (
              <Card key={plan.id} className="border-gray-200 bg-gray-50">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <h4 className="font-medium text-gray-900">
                        Action {index + 1}: {plan.title}
                      </h4>
                      <Badge variant="outline" className="text-xs bg-white">
                        Planned
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-gray-700">{plan.description}</p>
                    
                    {plan.file_link && (
                      <div className="pt-2 border-t border-gray-200">
                        <a 
                          href={plan.file_link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 text-sm underline inline-flex items-center gap-1"
                        >
                          📎 View attachment
                        </a>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
            <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Action Plans</h3>
            <p className="text-gray-600">No action plans are available for this anomaly.</p>
          </div>
        )}
      </CollapsibleCard>
    </div>
  );
} 