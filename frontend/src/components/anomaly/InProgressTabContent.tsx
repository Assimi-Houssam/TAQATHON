"use client";

import React, { useState } from "react";
import { AnomalyWithRelations } from "@/types/anomaly";
import { ActionPlanTable } from "./ActionPlanTable";

interface InProgressTabContentProps {
  anomaly: AnomalyWithRelations;
  onUpdate: (updates: Partial<AnomalyWithRelations>) => Promise<void>;
  onStatusChange: (newStatus: AnomalyWithRelations['status']) => Promise<void>;
}

export function InProgressTabContent({ anomaly, onUpdate, onStatusChange }: InProgressTabContentProps) {
  return (
    <div className="space-y-6">
      {/* Action Plans */}
      <ActionPlanTable 
        anomalyId={anomaly.id}
        showHeader={true}
        collapsible={true}
        defaultOpen={true}
      />
    </div>
  );
} 