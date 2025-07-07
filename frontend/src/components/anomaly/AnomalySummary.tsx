"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Settings, Tag, MapPin, AlertTriangle, Clock, User } from "lucide-react";
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
      {/* Anomaly Header */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-gray-600" />
            <CardTitle className="text-lg">Anomaly Details</CardTitle>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge className={statusColors[anomaly.status]}>
                {anomaly.status}
              </Badge>
              <Badge className={criticityColors[criticalityLevel]}>
                {criticalityLevel}
              </Badge>
            </div>
            <p className="text-sm font-mono text-gray-600">
              {anomaly.code || anomaly.id}
            </p>
          </div>
        </CardHeader>
      </Card>

      {/* Key Information */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-gray-900">Key Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 pt-0">
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <Settings className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Equipment</p>
                <p className="text-sm text-gray-900 break-words">{anomaly.equipment}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-2">
              <Calendar className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Detected</p>
                <p className="text-sm text-gray-900">{new Date(anomaly.date_apparition).toLocaleDateString()}</p>
              </div>
            </div>
            
            {anomaly.origin && (
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Origin</p>
                  <p className="text-sm text-gray-900 break-words">{anomaly.origin}</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Criticality Breakdown */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-gray-900">Criticality Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">Process Safety</span>
              <Badge variant="outline" className="text-xs">
                {anomaly.process_safety}/5
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">Reliability</span>
              <Badge variant="outline" className="text-xs">
                {anomaly.fiabilite_integrite}/5
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">Availability</span>
              <Badge variant="outline" className="text-xs">
                {anomaly.disponibilite}/5
              </Badge>
            </div>
            <div className="pt-2 border-t">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">Total Score</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold">{anomaly.criticality}/15</span>
                  <Badge className={criticityColors[criticalityLevel]} size="sm">
                    {criticalityLevel}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Description */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-gray-900">Description</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-sm text-gray-700 leading-relaxed">
            {anomaly.description}
          </p>
        </CardContent>
      </Card>

      {/* Timestamps */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-gray-900">Timeline</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 pt-0">
          <div className="flex items-center gap-2">
            <Clock className="h-3 w-3 text-gray-400" />
            <div className="flex-1">
              <p className="text-xs text-gray-500">Created</p>
              <p className="text-xs text-gray-900">{new Date(anomaly.created_at).toLocaleString()}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-3 w-3 text-gray-400" />
            <div className="flex-1">
              <p className="text-xs text-gray-500">Last Updated</p>
              <p className="text-xs text-gray-900">{new Date(anomaly.updated_at).toLocaleString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 