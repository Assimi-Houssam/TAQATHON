"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, useDraggable, useDroppable } from "@dnd-kit/core";
import { Plus, Calendar as CalendarIcon, Clock, ChevronLeft, ChevronRight, Upload, Loader2, FileUp, Trash2 } from "lucide-react";
import { useMaintenanceWindows, useMaintenanceWindowMutations } from "@/hooks/useMaintenanceWindows";
import { useAnomalies, useAnomalyMutations } from "@/hooks/useAnomalies";
import { MaintenanceWindow, Anomaly } from "@/types/anomaly";
import { toast } from "sonner";

function DraggableAnomaly({ anomaly, isInWindow = false }: { anomaly: Anomaly; isInWindow?: boolean }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: anomaly.id,
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 1,
  } : undefined;

  const getCriticalityColor = (criticality?: string) => {
    if (!criticality) return "bg-gray-500";
    const numericCriticality = parseFloat(criticality);
    if (numericCriticality >= 13) return "bg-red-500"; // Critical
    if (numericCriticality >= 10) return "bg-orange-500"; // High
    if (numericCriticality >= 7) return "bg-yellow-500"; // Medium
    return "bg-green-500"; // Low
  };

  if (isInWindow) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        {...listeners}
        {...attributes}
        className="bg-white border border-dashed border-gray-300 rounded p-3 h-20 cursor-grab active:cursor-grabbing transition-all hover:border-blue-400 hover:bg-blue-50"
      >
        <div className="flex items-center justify-between mb-1">
          <span className="font-medium text-sm text-black">{anomaly.num_equipments || 'N/A'}</span>
          <div className={`w-3 h-3 rounded-full ${getCriticalityColor(anomaly.criticite)}`} />
        </div>
        <p className="text-sm text-gray-700 leading-tight line-clamp-2">{anomaly.descreption_anomalie || 'No description'}</p>
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
          <span className="font-semibold text-sm">{anomaly.num_equipments || 'N/A'}</span>
          <div className={`w-3 h-3 rounded-full ${getCriticalityColor(anomaly.criticite)}`} />
        </div>
        <p className="text-sm text-gray-700 mb-1">{anomaly.descreption_anomalie || 'No description'}</p>
        <p className="text-xs text-gray-500">{anomaly.systeme || 'Unknown system'}</p>
      </CardContent>
    </Card>
  );
}

function MaintenanceWindowCard({ 
  window, 
  assignedAnomalies,
  onRemove,
  isLoading = false
}: { 
  window: MaintenanceWindow;
  assignedAnomalies: Anomaly[];
  onRemove: (windowId: string) => void;
  isLoading?: boolean;
}) {
  const { isOver, setNodeRef } = useDroppable({
    id: window.id,
  });

  const startDate = new Date(window.scheduled_start);
  const endDate = new Date(window.scheduled_end);
  
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
    <div className="bg-white rounded-lg border border-gray-300 overflow-hidden transition-all duration-200 w-[380px] flex-shrink-0 horizontal-scroll-item">
      {/* Header */}
      <div className="bg-gray-100 p-4 border-b border-dashed border-gray-300 relative">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button 
              className="absolute top-3 right-3 w-6 h-6 bg-gray-200 hover:bg-red-100 rounded-full flex items-center justify-center text-gray-600 hover:text-red-600 text-sm font-medium transition-all duration-200"
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Maintenance Window</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this maintenance window? This action cannot be undone and will move all assigned anomalies back to unassigned.
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
        
        <div className="flex items-center gap-2 mb-2">
          <CalendarIcon className="h-4 w-4 text-gray-600" />
          <h3 className="font-semibold text-black text-lg">Window #{window.id.slice(-4)}</h3>
          {window.requires_stopping && (
            <Badge variant="destructive" className="text-xs">Requires Stop</Badge>
          )}
        </div>
        
        <div className="flex items-center gap-2 text-sm text-gray-700 mb-1">
          <Clock className="h-3 w-3" />
          <span>{formatProfessionalDate(startDate, endDate)}</span>
        </div>
        
        <p className="text-sm text-gray-600">
          {window.assigned_team || 'No team assigned'}
          {window.duration_of_intervention && (
            <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
              {window.duration_of_intervention}h
            </span>
          )}
        </p>
        
        {window.notes && (
          <p className="text-xs text-gray-500 mt-2 italic">{window.notes}</p>
        )}
      </div>

      {/* Content Area */}
      <div 
        ref={setNodeRef}
        className={`min-h-[200px] p-4 transition-all duration-200 ${
          isOver 
            ? 'bg-blue-50 border-t-2 border-blue-400' 
            : 'bg-white'
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium text-gray-700">
            Anomalies
          </h4>
          <div className="bg-gray-100 text-gray-700 text-xs font-medium px-2 py-1 rounded">
            {assignedAnomalies.length}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 min-h-[160px]">
          {assignedAnomalies.map((anomaly) => (
            <DraggableAnomaly key={anomaly.id} anomaly={anomaly} isInWindow={true} />
          ))}
          {assignedAnomalies.length === 0 && (
            <div className="col-span-2 text-center py-8">
              <div className="text-gray-400 text-sm">Drop anomalies here</div>
              <div className="text-gray-300 text-xs mt-1">Drag and drop to organize</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function MaintenanceWindows() {
  const [isMounted, setIsMounted] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [showAddWindow, setShowAddWindow] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [newWindow, setNewWindow] = useState({
    scheduled_start: '',
    scheduled_end: '',
    assigned_team: '',
    notes: '',
    duration_of_intervention: '',
    requires_stopping: false,
  });

  // Horizontal scrolling state and refs
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Hook queries
  const { data: maintenanceWindowsData, isLoading: isLoadingWindows, error: windowsError } = useMaintenanceWindows({
    enabled: true,
    limit: 50, // Get more windows for the timeline view
  });

  const { data: anomaliesData, isLoading: isLoadingAnomalies } = useAnomalies({
    enabled: true,
    limit: 100, // Get more anomalies for drag and drop
  });

  // Hook mutations
  const {
    createMaintenanceWindow,
    createMaintenanceWindowFromFile,
    deleteMaintenanceWindow,
    attachMaintenanceWindowToAnomaly,
  } = useMaintenanceWindowMutations();

  const { attachMaintenanceWindow } = useAnomalyMutations();

  // Check scroll position and update arrow visibility
  const checkScrollPosition = () => {
    if (!scrollContainerRef.current) return;
    
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
  };

  // Scroll functions
  const scrollLeft = () => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const cardWidth = 380;
    const gap = 24;
    const scrollAmount = cardWidth + gap;
    
    container.scrollBy({
      left: -scrollAmount,
      behavior: 'smooth'
    });
    
    setTimeout(checkScrollPosition, 300);
  };

  const scrollRight = () => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const cardWidth = 380;
    const gap = 24;
    const scrollAmount = cardWidth + gap;
    
    container.scrollBy({
      left: scrollAmount,
      behavior: 'smooth'
    });
    
    setTimeout(checkScrollPosition, 300);
  };

  // Ensure component only renders after hydration
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Check scroll position on mount and when windows change
  useEffect(() => {
    if (isMounted && maintenanceWindowsData) {
      checkScrollPosition();
    }
  }, [isMounted, maintenanceWindowsData]);

  // Disable mouse wheel scrolling and add keyboard navigation
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.target !== document.body) return;
      
      if (event.key === 'ArrowLeft' && canScrollLeft) {
        event.preventDefault();
        scrollLeft();
      } else if (event.key === 'ArrowRight' && canScrollRight) {
        event.preventDefault();
        scrollRight();
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      container.removeEventListener('wheel', handleWheel);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [canScrollLeft, canScrollRight, isMounted]);

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

    // Attach anomaly to maintenance window via API
    attachMaintenanceWindowToAnomaly.mutate({
      anomalyId,
      maintenanceId: targetWindowId,
    }, {
      onSuccess: () => {
        toast.success("Anomaly assigned to maintenance window successfully");
      },
      onError: (error) => {
        console.error("Failed to assign anomaly:", error);
        toast.error("Failed to assign anomaly to maintenance window");
      }
    });

    setActiveId(null);
  };

  const handleAddWindow = () => {
    if (!newWindow.scheduled_start || !newWindow.scheduled_end) {
      toast.error("Please fill in all required fields");
      return;
    }

    const windowData = {
      scheduled_start: newWindow.scheduled_start,
      scheduled_end: newWindow.scheduled_end,
      assigned_team: newWindow.assigned_team || undefined,
      notes: newWindow.notes || undefined,
      duration_of_intervention: newWindow.duration_of_intervention ? parseInt(newWindow.duration_of_intervention) : undefined,
      requires_stopping: newWindow.requires_stopping,
    };

    createMaintenanceWindow.mutate(windowData, {
      onSuccess: () => {
        toast.success("Maintenance window created successfully");
        setNewWindow({
          scheduled_start: '',
          scheduled_end: '',
          assigned_team: '',
          notes: '',
          duration_of_intervention: '',
          requires_stopping: false,
        });
        setShowAddWindow(false);
      },
      onError: (error) => {
        console.error("Failed to create maintenance window:", error);
        toast.error("Failed to create maintenance window");
      }
    });
  };

  const handleRemoveWindow = (windowId: string) => {
    deleteMaintenanceWindow.mutate(windowId, {
      onSuccess: () => {
        toast.success("Maintenance window deleted successfully");
      },
      onError: (error) => {
        console.error("Failed to delete maintenance window:", error);
        toast.error("Failed to delete maintenance window");
      }
    });
  };

  const handleFileUpload = () => {
    if (!uploadFile) {
      toast.error("Please select a file");
      return;
    }

    createMaintenanceWindowFromFile.mutate(uploadFile, {
      onSuccess: () => {
        toast.success("Maintenance windows imported successfully");
        setUploadFile(null);
        setShowUploadDialog(false);
      },
      onError: (error) => {
        console.error("Failed to upload file:", error);
        toast.error("Failed to import maintenance windows");
      }
    });
  };

  const getAssignedAnomalies = (windowId: string): Anomaly[] => {
    if (!anomaliesData?.anomalies) return [];
    return anomaliesData.anomalies.filter(anomaly => anomaly.maintenance_window_id === windowId);
  };

  const getUnassignedAnomalies = (): Anomaly[] => {
    if (!anomaliesData?.anomalies) return [];
    return anomaliesData.anomalies.filter(anomaly => !anomaly.maintenance_window_id);
  };

  const activeAnomaly = anomaliesData?.anomalies?.find(anomaly => anomaly.id === activeId);

  // Sort maintenance windows by date
  const sortedMaintenanceWindows = maintenanceWindowsData?.maintenanceWindows?.sort((a, b) => {
    return new Date(a.scheduled_start).getTime() - new Date(b.scheduled_start).getTime();
  }) || [];

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

  if (windowsError) {
    return (
      <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
        <div className="bg-white rounded-lg shadow-sm border border-red-200 p-6">
          <div className="text-red-600">
            <h1 className="text-2xl font-bold mb-2">Error Loading Maintenance Windows</h1>
            <p>Failed to load maintenance windows. Please try refreshing the page.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="p-6 space-y-6 bg-gray-50 flex flex-col h-full dashboard-container">

        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Maintenance Windows</h1>
              <p className="text-gray-600 mt-1">Assign anomalies to maintenance windows</p>
              {isLoadingWindows || isLoadingAnomalies ? (
                <div className="flex items-center gap-2 mt-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm text-gray-500">Loading...</span>
                </div>
              ) : (
                <div className="text-sm text-gray-500 mt-2">
                  {sortedMaintenanceWindows.length} maintenance windows, {getUnassignedAnomalies().length} unassigned anomalies
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50">
                    <Upload className="h-4 w-4 mr-2" />
                    Import from Excel
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[400px]">
                  <DialogHeader>
                    <DialogTitle>Import Maintenance Windows</DialogTitle>
                  </DialogHeader>
                  <div className="py-4">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <FileUp className="h-8 w-8 text-gray-400 mx-auto mb-4" />
                      <div className="text-sm text-gray-600 mb-4">
                        Upload an Excel file with maintenance windows
                      </div>
                      <input
                        type="file"
                        accept=".xlsx,.xls"
                        onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                        className="hidden"
                        id="file-upload"
                      />
                      <label
                        htmlFor="file-upload"
                        className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                      >
                        Choose File
                      </label>
                      {uploadFile && (
                        <div className="mt-2 text-sm text-gray-700">
                          Selected: {uploadFile.name}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button 
                      onClick={handleFileUpload}
                      disabled={!uploadFile || createMaintenanceWindowFromFile.isPending}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {createMaintenanceWindowFromFile.isPending ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Upload className="h-4 w-4 mr-2" />
                      )}
                      Import
                    </Button>
                    <Button variant="outline" onClick={() => setShowUploadDialog(false)}>
                      Cancel
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

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
                      <label className="block text-sm font-medium text-gray-700 mb-2">Start Date & Time *</label>
                      <input
                        type="datetime-local"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={newWindow.scheduled_start}
                        onChange={(e) => setNewWindow(prev => ({ ...prev, scheduled_start: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">End Date & Time *</label>
                      <input
                        type="datetime-local"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={newWindow.scheduled_end}
                        onChange={(e) => setNewWindow(prev => ({ ...prev, scheduled_end: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Assigned Team</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={newWindow.assigned_team}
                        onChange={(e) => setNewWindow(prev => ({ ...prev, assigned_team: e.target.value }))}
                        placeholder="e.g., Maintenance Team A"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Duration (hours)</label>
                      <input
                        type="number"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={newWindow.duration_of_intervention}
                        onChange={(e) => setNewWindow(prev => ({ ...prev, duration_of_intervention: e.target.value }))}
                        placeholder="e.g., 8"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                      <textarea
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={newWindow.notes}
                        onChange={(e) => setNewWindow(prev => ({ ...prev, notes: e.target.value }))}
                        placeholder="Additional notes about this maintenance window..."
                        rows={3}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          className="form-checkbox h-4 w-4 text-blue-600"
                          checked={newWindow.requires_stopping}
                          onChange={(e) => setNewWindow(prev => ({ ...prev, requires_stopping: e.target.checked }))}
                        />
                        <span className="text-sm font-medium text-gray-700">Requires equipment stopping</span>
                      </label>
                    </div>
                  </div>
                  <div className="flex gap-3 mt-6">
                    <Button 
                      onClick={handleAddWindow} 
                      disabled={!newWindow.scheduled_start || !newWindow.scheduled_end || createMaintenanceWindow.isPending}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {createMaintenanceWindow.isPending ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Plus className="h-4 w-4 mr-2" />
                      )}
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
        </div>

        {/* Unassigned Anomalies */}
        {getUnassignedAnomalies().length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Unassigned Anomalies</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {getUnassignedAnomalies().map((anomaly) => (
                <DraggableAnomaly key={anomaly.id} anomaly={anomaly} />
              ))}
            </div>
          </div>
        )}

        {/* Maintenance Windows Timeline */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 flex-1 flex flex-col select-none max-w-full overflow-hidden">
          <div className="relative h-full w-full max-w-full">
            {/* Navigation Arrows */}
            {canScrollLeft && (
              <Button
                variant="outline"
                size="icon"
                className="absolute left-2 top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full bg-white border hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
                onClick={scrollLeft}
                aria-label="Scroll left to view previous maintenance windows"
              >
                <ChevronLeft className="h-5 w-5 text-gray-700" />
              </Button>
            )}
            
            {canScrollRight && (
              <Button
                variant="outline"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full bg-white border hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
                onClick={scrollRight}
                aria-label="Scroll right to view more maintenance windows"
              >
                <ChevronRight className="h-5 w-5 text-gray-700" />
              </Button>
            )}

            {/* Scrollable Container */}
            <div
              ref={scrollContainerRef}
              className="flex gap-6 horizontal-scroll-container scroll-smooth h-full pb-4"
              onScroll={checkScrollPosition}
            >
              {isLoadingWindows ? (
                <div className="flex items-center justify-center w-full h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </div>
              ) : sortedMaintenanceWindows.length > 0 ? (
                sortedMaintenanceWindows.map((window) => (
                  <MaintenanceWindowCard
                    key={window.id}
                    window={window}
                    assignedAnomalies={getAssignedAnomalies(window.id)}
                    onRemove={handleRemoveWindow}
                    isLoading={deleteMaintenanceWindow.isPending}
                  />
                ))
              ) : (
                <div className="flex items-center justify-center w-full h-64 text-gray-500">
                  <div className="text-center">
                    <CalendarIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Maintenance Windows</h3>
                    <p className="text-gray-500">Create your first maintenance window to get started.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <DragOverlay>
          {activeAnomaly ? (
            <div className="bg-white rounded-lg border-2 border-blue-400 shadow-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-sm">{activeAnomaly.num_equipments || 'N/A'}</span>
                <div className={`w-3 h-3 rounded-full ${
                  !activeAnomaly.criticite ? "bg-gray-500" :
                  parseFloat(activeAnomaly.criticite) >= 13 ? "bg-red-500" : 
                  parseFloat(activeAnomaly.criticite) >= 10 ? "bg-orange-500" : 
                  parseFloat(activeAnomaly.criticite) >= 7 ? "bg-yellow-500" : "bg-green-500"
                }`} />
              </div>
              <p className="text-sm text-gray-700 mb-1">{activeAnomaly.descreption_anomalie || 'No description'}</p>
              <p className="text-xs text-gray-500">{activeAnomaly.systeme || 'Unknown system'}</p>
            </div>
          ) : null}
        </DragOverlay>
      </div>
    </DndContext>
  );
}