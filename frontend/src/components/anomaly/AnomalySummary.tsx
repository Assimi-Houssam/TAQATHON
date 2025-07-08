"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Settings, 
  Users, 
  FileText, 
  Eye, 
  Calendar, 
  Target, 
  Shield, 
  Activity, 
  Hash,
  Building2,
  Clock,
  AlertTriangle,
  ChevronRight
} from "lucide-react";
import { Anomaly, AnomalyCriticality, getCriticalityLevel } from "@/types/anomaly";

interface AnomalySummaryProps {
  anomaly: Anomaly;
}

const criticityColors: Record<AnomalyCriticality, string> = {
  LOW: "bg-green-50 text-green-700 border-green-200",
  MEDIUM: "bg-yellow-50 text-yellow-700 border-yellow-200", 
  HIGH: "bg-orange-50 text-orange-700 border-orange-200",
  CRITICAL: "bg-red-50 text-red-700 border-red-200"
};

export function AnomalySummary({ anomaly }: AnomalySummaryProps) {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const criticalityLevel = getCriticalityLevel(anomaly.criticite);
  
  // Helper function to get display value or fallback
  const getDisplayValue = (value: any, fallback = "Not specified") => {
    return value && value !== "" ? value : fallback;
  };

  // Helper function to safely format anomaly ID
  const formatAnomalyId = (id?: string) => {
    if (!id || typeof id !== 'string') {
      return "#LOADING...";
    }
    return `#${id.slice(-8).toUpperCase()}`;
  };

  return (
    <div className="space-y-4">
      {/* Main Summary Card - Important Data Only */}
      <Card className="shadow-sm border border-gray-200">
        <CardContent className="p-6">
          {/* Header with Anomaly ID */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Anomaly ID</p>
                <p className="font-mono text-sm font-semibold text-gray-900">
                  {formatAnomalyId(anomaly.id)}
                </p>
              </div>
            </div>
            <Badge className={criticityColors[criticalityLevel]} variant="outline">
              <Target className="h-3 w-3 mr-1" />
              {criticalityLevel}
            </Badge>
          </div>

          {/* Important Information */}
          <div className="space-y-5">
            {/* Description */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Description</span>
              </div>
              <p className="text-gray-900 leading-relaxed pl-6 line-clamp-3">
                {anomaly.descreption_anomalie || "No description provided"}
              </p>
            </div>

            {/* Equipment */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Settings className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Equipment</span>
              </div>
              <p className="text-gray-900 pl-6">
                {anomaly.num_equipments || anomaly.systeme || "No equipment specified"}
              </p>
            </div>

            {/* Owning Section - using origin as fallback since section_proprietaire isn't in main interface */}
            {anomaly.origine && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Origin</span>
                </div>
                <p className="text-gray-900 pl-6">
                  {anomaly.origine}
                </p>
              </div>
            )}
          </div>

          {/* View Details Button */}
          <div className="mt-6 pt-4 border-t border-gray-100">
            <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  className="w-full justify-between group hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    <span>View All Details</span>
                  </div>
                  <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </DialogTrigger>
              
              <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                      <AlertTriangle className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <span>Anomaly Details</span>
                      <p className="text-sm font-normal text-gray-500 mt-1">
                        {formatAnomalyId(anomaly.id)}
                      </p>
                    </div>
                  </DialogTitle>
                </DialogHeader>

                <div className="space-y-5 mt-4">
                  {/* Two-Column Layout */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    
                    {/* Left Column - Essential Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        Essential Information
                      </h3>
                      
                      {/* Description - Full Width */}
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <FileText className="h-4 w-4 text-gray-600" />
                          <span className="text-sm font-medium text-gray-700">Description</span>
                        </div>
                        <p className="text-gray-900 leading-relaxed text-sm">
                          {anomaly.descreption_anomalie || "No description provided"}
                        </p>
                      </div>

                      {/* Equipment and Section in compact grid */}
                      <div className="grid grid-cols-1 gap-3">
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-2 mb-1">
                            <Settings className="h-4 w-4 text-gray-600" />
                            <span className="text-sm font-medium text-gray-700">Equipment</span>
                          </div>
                          <p className="text-gray-900 text-sm">{anomaly.num_equipments || anomaly.systeme || "No equipment specified"}</p>
                        </div>

                        {anomaly.origine && (
                          <div className="p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-2 mb-1">
                              <Users className="h-4 w-4 text-gray-600" />
                              <span className="text-sm font-medium text-gray-700">Origin</span>
                            </div>
                            <p className="text-gray-900 text-sm">{anomaly.origine}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right Column - Additional Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                        Additional Information
                      </h3>
                      
                      {/* Date and Criticality in compact layout */}
                      <div className="grid grid-cols-1 gap-3">
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-2 mb-1">
                            <Calendar className="h-4 w-4 text-gray-600" />
                            <span className="text-sm font-medium text-gray-700">Detection Date</span>
                          </div>
                          <p className="text-gray-900 text-sm">
                            {anomaly.date_detection ? new Date(anomaly.date_detection).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            }) : "No date specified"}
                          </p>
                        </div>

                        <div className="p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-2 mb-1">
                            <Target className="h-4 w-4 text-gray-600" />
                            <span className="text-sm font-medium text-gray-700">Overall Criticality</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={criticityColors[criticalityLevel]} variant="outline">
                              {criticalityLevel}
                            </Badge>
                            <span className="text-xs text-gray-600">({anomaly.criticite || 0}/15)</span>
                          </div>
                        </div>
                      </div>

                      {/* Timeline */}
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="h-4 w-4 text-gray-600" />
                          <span className="text-sm font-medium text-gray-700">Timeline</span>
                        </div>
                        <div className="space-y-1.5 text-xs">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Created:</span>
                            <span className="text-gray-900 font-medium">
                              {anomaly.created_at ? new Date(anomaly.created_at).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              }) : "No date"}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Updated:</span>
                            <span className="text-gray-900 font-medium">
                              {anomaly.updated_at ? new Date(anomaly.updated_at).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              }) : "No date"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Criticality Breakdown - Minimal */}
                  <div className="border-t pt-3">
                    <h3 className="text-base font-medium text-gray-900 mb-2 flex items-center gap-2">
                      <Shield className="h-4 w-4 text-gray-600" />
                      Criticality Assessment
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="grid grid-cols-3 gap-3">
                        <div className="text-center">
                          <div className="text-lg font-semibold text-gray-900">{anomaly.process_safty || 0}/5</div>
                          <div className="text-xs text-gray-600">Process Safety</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold text-gray-900">{anomaly.fiablite_integrite || 0}/5</div>
                          <div className="text-xs text-gray-600">Reliability</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold text-gray-900">{anomaly.disponsibilite || 0}/5</div>
                          <div className="text-xs text-gray-600">Availability</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 