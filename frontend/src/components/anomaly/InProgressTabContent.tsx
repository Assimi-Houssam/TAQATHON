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
  const handleAddAction = () => {
    // TODO: Implement add action functionality
    console.log("Add action clicked");
  };

  const handleEditAction = (item: any) => {
    // TODO: Implement edit action functionality
    console.log("Edit action clicked", item);
  };

  const handleDeleteAction = (id: string) => {
    // TODO: Implement delete action functionality
    console.log("Delete action clicked", id);
  };

  return (
    <div className="space-y-6">
      <ActionPlanTable 
        onAddAction={handleAddAction}
        onEditAction={handleEditAction}
        onDeleteAction={handleDeleteAction}
      />
    </div>
  );
} 