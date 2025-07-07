"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Settings, Tag, MapPin, AlertTriangle, Clock, User, Target } from "lucide-react";
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

const statusColors: Record<Anomaly['status'], string> = {
  "New": "bg-blue-50 text-blue-700 border-blue-200",
  "In Progress": "bg-purple-50 text-purple-700 border-purple-200",
  "Closed": "bg-gray-50 text-gray-700 border-gray-200"
};

export function AnomalySummary({ anomaly }: AnomalySummaryProps) {
  const criticalityLevel = getCriticalityLevel(anomaly.criticality);
  
  return (
    <div className="space-y-4">
      {/* Main Status Card - Most Important Info First */}
      <Card className="">
        <CardContent className="p-4">
          {/* Status & Criticality - Top Priority */}
          <div className="flex items-center justify-between mb-4">
            <Badge className={statusColors[anomaly.status]} variant="outline">
              {anomaly.status}
            </Badge>
            <Badge className={criticityColors[criticalityLevel]} variant="outline">
              <Target className="h-3 w-3 mr-1" />
              {criticalityLevel}
            </Badge>
          </div>
          
          {/* Anomaly ID */}
          <div className="mb-4">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Anomaly ID</p>
            <p className="text-sm font-mono text-gray-900 bg-gray-50 px-2 py-1 rounded border">
              {anomaly.code || anomaly.id}
            </p>
          </div>

          {/* Equipment & Origin - Compact Layout */}
          <div className="space-y-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Settings className="h-3 w-3 text-gray-500" />
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Equipment</span>
              </div>
              <p className="text-sm text-gray-900 leading-tight">{anomaly.equipment}</p>
            </div>
            
            {anomaly.origin && (
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <MapPin className="h-3 w-3 text-gray-500" />
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Origin</span>
                </div>
                <p className="text-sm text-gray-900 leading-tight">{anomaly.origin}</p>
              </div>
            )}
            
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="h-3 w-3 text-gray-500" />
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Detected</span>
              </div>
              <p className="text-sm text-gray-900">{new Date(anomaly.date_apparition).toLocaleDateString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Description - Secondary Priority */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="h-4 w-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-900">Description</span>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed">
            {anomaly.description}
          </p>
        </CardContent>
      </Card>
    </div>
  );
} 