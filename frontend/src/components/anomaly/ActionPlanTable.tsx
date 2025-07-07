"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Plus,
  Edit3,
  Trash2,
  User,
  Activity
} from "lucide-react";

interface ActionPlanItem {
  id: string;
  action: string;
  responsible: string;
  pdrsAvailable: string;
  internalResources: string;
  externalResources: string;
  status: 'Not Started' | 'In Progress' | 'Completed' | 'On Hold';
}

interface ActionPlanTableProps {
  title?: string;
  showHeader?: boolean;
  className?: string;
  onAddAction?: () => void;
  onEditAction?: (item: ActionPlanItem) => void;
  onDeleteAction?: (id: string) => void;
  items?: ActionPlanItem[];
}

export function ActionPlanTable({ 
  title = "Action Plan",
  showHeader = true,
  className = "",
  onAddAction,
  onEditAction,
  onDeleteAction,
  items = []
}: ActionPlanTableProps) {
  const [actionPlanItems, setActionPlanItems] = useState<ActionPlanItem[]>(items);

  const getStatusBadge = (status: ActionPlanItem['status']) => {
    const variants = {
      'Not Started': 'secondary',
      'In Progress': 'default',
      'Completed': 'default',
      'On Hold': 'destructive'
    } as const;

    const colors = {
      'Not Started': 'bg-gray-100 text-gray-800',
      'In Progress': 'bg-blue-100 text-blue-800',
      'Completed': 'bg-green-100 text-green-800',
      'On Hold': 'bg-red-100 text-red-800'
    };

    return (
      <Badge variant={variants[status]} className={`${colors[status]} border-none`}>
        {status}
      </Badge>
    );
  };

  const handleAddAction = () => {
    if (onAddAction) {
      onAddAction();
    }
  };

  const handleEditAction = (item: ActionPlanItem) => {
    if (onEditAction) {
      onEditAction(item);
    }
  };

  const handleDeleteAction = (id: string) => {
    if (onDeleteAction) {
      onDeleteAction(id);
    }
  };

  return (
    <Card className={`shadow-sm ${className}`}>
      {showHeader && (
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Activity className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-lg font-semibold">{title}</CardTitle>
            </div>
            <Button 
              size="sm" 
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={handleAddAction}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Action
            </Button>
          </div>
        </CardHeader>
      )}
      <CardContent className="p-0">
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
                <th className="text-left py-3 px-4 font-medium text-gray-900 text-sm w-20">Actions</th>
              </tr>
            </thead>
            <tbody>
              {actionPlanItems.length === 0 ? (
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
                    <td className="py-3 px-4 text-sm text-gray-900">{item.action}</td>
                    <td className="py-3 px-4 text-sm text-gray-700">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400" />
                        {item.responsible}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-700">{item.pdrsAvailable}</td>
                    <td className="py-3 px-4 text-sm text-gray-700">{item.internalResources}</td>
                    <td className="py-3 px-4 text-sm text-gray-700">{item.externalResources}</td>
                    <td className="py-3 px-4">{getStatusBadge(item.status)}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 hover:bg-gray-100"
                          onClick={() => handleEditAction(item)}
                        >
                          <Edit3 className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                          onClick={() => handleDeleteAction(item.id)}
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
    </Card>
  );
} 