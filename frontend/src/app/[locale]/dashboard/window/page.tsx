"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, useDraggable, useDroppable } from "@dnd-kit/core";
import { Plus, Calendar as CalendarIcon, Clock } from "lucide-react";

interface Anomaly {
  id: string;
  title: string;
  criticality: "critical" | "high" | "medium" | "low";
  equipment: string;
  status: string;
  assignedToWindow?: string;
}

interface MaintenanceWindow {
  id: string;
  title: string;
  fromDate: string;
  toDate: string;
  equipment: string;
  assignedAnomalies: string[];
  color: string;
}

const mockAnomalies: Anomaly[] = [
  { id: "ANO-001", title: "Pump Pressure Drop", criticality: "critical", equipment: "Pump A-101", status: "New", assignedToWindow: "MW-001" },
  { id: "ANO-002", title: "Valve Leak", criticality: "high", equipment: "Valve B-202", status: "New", assignedToWindow: "MW-002" },
  { id: "ANO-003", title: "Temperature Variance", criticality: "medium", equipment: "Heat Exchanger C-301", status: "New", assignedToWindow: "MW-001" },
  { id: "ANO-004", title: "Motor Vibration", criticality: "high", equipment: "Motor D-401", status: "New", assignedToWindow: "MW-004" },
  { id: "ANO-005", title: "Flow Rate Issue", criticality: "low", equipment: "Pump E-501", status: "New", assignedToWindow: "MW-003" },
  { id: "ANO-006", title: "Bearing Noise", criticality: "medium", equipment: "Compressor F-601", status: "New", assignedToWindow: "MW-002" },
  { id: "ANO-007", title: "Seal Deterioration", criticality: "critical", equipment: "Pump G-701", status: "New", assignedToWindow: "MW-005" },
  { id: "ANO-008", title: "Control System Error", criticality: "high", equipment: "PLC H-801", status: "New", assignedToWindow: "MW-003" },
];

const mockMaintenanceWindows: MaintenanceWindow[] = [
  { id: "MW-001", title: "Weekly Inspection", fromDate: "2025-07-14", toDate: "2025-07-16", equipment: "Pump Area", assignedAnomalies: ["ANO-001", "ANO-003"], color: "bg-slate-600" },
  { id: "MW-002", title: "Monthly Maintenance", fromDate: "2025-07-21", toDate: "2025-07-23", equipment: "Heat Exchangers", assignedAnomalies: ["ANO-002", "ANO-006"], color: "bg-slate-600" },
  { id: "MW-003", title: "Valve Maintenance", fromDate: "2025-07-28", toDate: "2025-07-30", equipment: "Valve Section", assignedAnomalies: ["ANO-005", "ANO-008"], color: "bg-slate-600" },
  { id: "MW-004", title: "Motor Overhaul", fromDate: "2025-08-04", toDate: "2025-08-06", equipment: "Motor Bay", assignedAnomalies: ["ANO-004","ANO-007"], color: "bg-slate-600" },
  // { id: "MW-005", title: "System Upgrade", fromDate: "2025-08-11", toDate: "2025-08-13", equipment: "Control Room", assignedAnomalies: ["ANO-007"], color: "bg-slate-600" },
  // { id: "MW-006", title: "Emergency Maintenance", fromDate: "2025-08-18", toDate: "2025-08-20", equipment: "Compressor Area", assignedAnomalies: [], color: "bg-slate-600" },
  // { id: "MW-007", title: "Quarterly Inspection", fromDate: "2025-08-25", toDate: "2025-08-27", equipment: "Electrical Panel", assignedAnomalies: [], color: "bg-slate-600" },
  // { id: "MW-008", title: "Pipeline Maintenance", fromDate: "2025-09-01", toDate: "2025-09-03", equipment: "Main Pipeline", assignedAnomalies: [], color: "bg-slate-600" },
];

function DraggableAnomaly({ anomaly, isInWindow = false }: { anomaly: Anomaly; isInWindow?: boolean }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: anomaly.id,
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 1,
  } : undefined;

  const getCriticalityColor = (criticality: string) => {
    switch (criticality) {
      case "critical": return "bg-red-500";
      case "high": return "bg-orange-500";
      case "medium": return "bg-yellow-500";
      case "low": return "bg-green-500";
      default: return "bg-gray-500";
    }
  };

  if (isInWindow) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        {...listeners}
        {...attributes}
        className="bg-white border border-gray-200 rounded-lg p-3 h-20 cursor-grab active:cursor-grabbing transition-all hover:shadow-sm"
      >
        <div className="flex items-center justify-between mb-1">
          <span className="font-medium text-sm">{anomaly.id}</span>
          <div className={`w-3 h-3 rounded-full ${getCriticalityColor(anomaly.criticality)}`} />
        </div>
        <p className="text-sm text-gray-700 leading-tight">{anomaly.title}</p>
        {/* <p className="text-xs text-gray-500 mt-1">{anomaly.equipment}</p> */}
      </div>
    );
  }

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow"
    >
      <CardContent className="p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="font-semibold text-sm">{anomaly.id}</span>
          <div className={`w-3 h-3 rounded-full ${getCriticalityColor(anomaly.criticality)}`} />
        </div>
        <p className="text-sm text-gray-700 mb-1">{anomaly.title}</p>
        <p className="text-xs text-gray-500">{anomaly.equipment}</p>
      </CardContent>
    </Card>
  );
}

function CalendarMaintenanceWindow({ 
  window, 
  assignedAnomalies,
  onRemove
}: { 
  window: MaintenanceWindow;
  assignedAnomalies: Anomaly[];
  onRemove: (windowId: string) => void;
}) {
  const { isOver, setNodeRef } = useDroppable({
    id: window.id,
  });

  const fromDate = new Date(window.fromDate);
  const toDate = new Date(window.toDate);
  
  const formatProfessionalDate = (from: Date, to: Date) => {
    const fromMonth = from.toLocaleDateString('en-US', { month: 'short' });
    const toMonth = to.toLocaleDateString('en-US', { month: 'short' });
    const year = from.getFullYear();
    
    if (from.getMonth() === to.getMonth()) {
      return `${fromMonth} ${from.getDate()}-${to.getDate()}, ${year}`;
    } else {
      return `${fromMonth} ${from.getDate()} - ${toMonth} ${to.getDate()}, ${year}`;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden group hover:shadow-xl transition-all duration-300 w-[380px]">
      <div className={`${window.color} p-6 text-white relative`}>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button className="absolute top-4 right-4 w-8 h-8 bg-black bg-opacity-10 hover:bg-opacity-20 rounded-full flex items-center justify-center text-white text-lg font-light transition-all duration-200 hover:scale-110">
              ×
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Maintenance Window</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{window.title}"? This action cannot be undone and will move all assigned issues back to unassigned.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => onRemove(window.id)} className="bg-red-600 hover:bg-red-700">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <div className="flex items-center gap-3 mb-3">
          <CalendarIcon className="h-5 w-5 opacity-90" />
          <h3 className="font-semibold text-lg tracking-tight">{window.title}</h3>
        </div>
        <div className="flex items-center gap-3 text-sm opacity-80 mb-2">
          <Clock className="h-4 w-4" />
          <span className="font-medium">{formatProfessionalDate(fromDate, toDate)}</span>
        </div>
        <p className="text-sm opacity-80 font-medium">{window.equipment}</p>
      </div>

      <div 
        ref={setNodeRef}
        className={`min-h-[200px] inherit transition-all duration-300 ${
          isOver 
            ? 'bg-gradient-to-br from-blue-50 to-indigo-50 border-t-2 border-blue-400' 
            : 'bg-gradient-to-br from-gray-50 to-slate-50 border-t border-gray-200'
        }`}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-semibold text-gray-700 tracking-wide uppercase">
              Issues
            </h4>
            <div className="bg-gray-200 text-gray-600 text-xs font-bold px-2 py-1 rounded-full">
              {assignedAnomalies.length}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 min-h-[200px]">
            {assignedAnomalies.map((anomaly) => (
              <DraggableAnomaly key={anomaly.id} anomaly={anomaly} isInWindow={true} />
            ))}
            {assignedAnomalies.length === 0 && (
              <div className="col-span-2 text-center py-12">
                <div className="text-gray-400 text-sm font-medium">Drop issues here</div>
                <div className="text-gray-300 text-xs mt-1">Drag and drop to organize</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MaintenanceWindows() {
  const [isMounted, setIsMounted] = useState(false);
  const [anomalies, setAnomalies] = useState<Anomaly[]>(mockAnomalies);
  const [maintenanceWindows, setMaintenanceWindows] = useState<MaintenanceWindow[]>(mockMaintenanceWindows);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [showAddWindow, setShowAddWindow] = useState(false);
  const [newWindow, setNewWindow] = useState({
    title: '',
    fromDate: '',
    toDate: '',
    equipment: '',
  });

  // Ensure component only renders after hydration
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) {
      setActiveId(null);
      return;
    }

    const anomalyId = active.id as string;
    const targetWindowId = over.id as string;

    const currentAnomaly = anomalies.find(a => a.id === anomalyId);
    const currentWindowId = currentAnomaly?.assignedToWindow;

    if (currentWindowId !== targetWindowId) {
      if (currentWindowId) {
        setMaintenanceWindows(prev => prev.map(window => 
          window.id === currentWindowId 
            ? { ...window, assignedAnomalies: window.assignedAnomalies.filter(id => id !== anomalyId) }
            : window
        ));
      }

      setMaintenanceWindows(prev => prev.map(window => 
        window.id === targetWindowId 
          ? { ...window, assignedAnomalies: [...window.assignedAnomalies, anomalyId] }
          : window
      ));

      setAnomalies(prev => prev.map(anomaly => 
        anomaly.id === anomalyId 
          ? { ...anomaly, assignedToWindow: targetWindowId }
          : anomaly
      ));
    }

    setActiveId(null);
  };

  const handleAddWindow = () => {
    if (newWindow.title && newWindow.equipment && newWindow.fromDate && newWindow.toDate) {
      const colors = ['bg-slate-600', 'bg-blue-700', 'bg-emerald-700', 'bg-amber-700', 'bg-red-700', 'bg-purple-700', 'bg-indigo-700', 'bg-teal-700'];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      
      const window: MaintenanceWindow = {
        id: `MW-${Date.now()}`,
        title: newWindow.title,
        fromDate: newWindow.fromDate,
        toDate: newWindow.toDate,
        equipment: newWindow.equipment,
        assignedAnomalies: [],
        color: randomColor,
      };

      setMaintenanceWindows(prev => [...prev, window]);
      setNewWindow({ title: '', fromDate: '', toDate: '', equipment: '' });
      setShowAddWindow(false);
    }
  };

  const handleRemoveWindow = (windowId: string) => {
    // Move anomalies back to unassigned
    const windowToRemove = maintenanceWindows.find(w => w.id === windowId);
    if (windowToRemove) {
      setAnomalies(prev => prev.map(anomaly => 
        windowToRemove.assignedAnomalies.includes(anomaly.id)
          ? { ...anomaly, assignedToWindow: undefined }
          : anomaly
      ));
    }

    setMaintenanceWindows(prev => prev.filter(w => w.id !== windowId));
  };

  const getAssignedAnomalies = (windowId: string) => {
    const window = maintenanceWindows.find(w => w.id === windowId);
    if (!window) return [];
    return anomalies.filter(anomaly => window.assignedAnomalies.includes(anomaly.id));
  };

  const activeAnomaly = anomalies.find(anomaly => anomaly.id === activeId);

  // Sort maintenance windows by date
  const sortedMaintenanceWindows = [...maintenanceWindows].sort((a, b) => {
    return new Date(a.fromDate).getTime() - new Date(b.fromDate).getTime();
  });

  // Show loading state until hydration is complete
  if (!isMounted) {
    return (
      <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="animate-pulse">
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      {/* <div className="p-6 space-y-6 bg-gray-50 min-h-screen"> */}
      <div className="p-6 space-y-6 bg-gray-50 flex flex-col h-full">

        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 ">
        <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Maintenance Windows</h1>
              <p className="text-gray-600 mt-1">Assign anomalies to maintenance windows</p>
            </div>
            <Dialog open={showAddWindow} onOpenChange={setShowAddWindow}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Window
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Add New Maintenance Window</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={newWindow.title}
                      onChange={(e) => setNewWindow(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="e.g., Weekly Inspection"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Equipment</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={newWindow.equipment}
                      onChange={(e) => setNewWindow(prev => ({ ...prev, equipment: e.target.value }))}
                      placeholder="e.g., Pump Area"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
                    <input
                      type="date"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={newWindow.fromDate}
                      onChange={(e) => setNewWindow(prev => ({ ...prev, fromDate: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
                    <input
                      type="date"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={newWindow.toDate}
                      onChange={(e) => setNewWindow(prev => ({ ...prev, toDate: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <Button 
                    onClick={handleAddWindow} 
                    className="bg-green-600 hover:bg-green-700"
                    disabled={!newWindow.title || !newWindow.equipment || !newWindow.fromDate || !newWindow.toDate}
                  >
                    Add Window
                  </Button>
                  <Button 
                    onClick={() => setShowAddWindow(false)} 
                    variant="outline"
                  >
                    Cancel
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Maintenance Windows Timeline */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex-1 flex flex-col">
        <div className="overflow-x-auto h-full">
            <div className="flex gap-6 pb-4" style={{ width: 'max-content', minWidth: '100%' }}>
              {sortedMaintenanceWindows.map((window) => (
                <div key={window.id} className="min-w-[320px] flex-shrink-0">
                  <CalendarMaintenanceWindow
                    window={window}
                    assignedAnomalies={getAssignedAnomalies(window.id)}
                    onRemove={handleRemoveWindow}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        <DragOverlay>
          {activeAnomaly ? (
            <div className="bg-white rounded-lg border-2 border-blue-400 shadow-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-sm">{activeAnomaly.id}</span>
                <div className={`w-3 h-3 rounded-full ${
                  activeAnomaly.criticality === "critical" ? "bg-red-500" : 
                  activeAnomaly.criticality === "high" ? "bg-orange-500" : 
                  activeAnomaly.criticality === "medium" ? "bg-yellow-500" : "bg-green-500"
                }`} />
              </div>
              <p className="text-sm text-gray-700 mb-1">{activeAnomaly.title}</p>
              <p className="text-xs text-gray-500">{activeAnomaly.equipment}</p>
            </div>
          ) : null}
        </DragOverlay>
      </div>
    </DndContext>
  );
}