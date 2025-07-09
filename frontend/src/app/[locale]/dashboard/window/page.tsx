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
        className="bg-white border border-dashed border-gray-300 rounded-lg p-3 h-14 cursor-grab active:cursor-grabbing transition-all hover:border-blue-400 hover:bg-blue-50"
      >
        <div className="flex items-center justify-between h-full">
          <div className="flex-1 min-w-0 pr-2">
            <div className="font-medium text-xs text-blue-600 truncate mb-1">
              {anomaly.num_equipments ? `#${anomaly.num_equipments.slice(-6)}` : '#N/A'}
            </div>
            <div className="text-sm text-gray-700 truncate">
              {anomaly.descreption_anomalie || 'No description'}
            </div>
          </div>
          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${getCriticalityColor(anomaly.criticite)}`} />
        </div>
      </div>
    );
  }

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="cursor-grab active:cursor-grabbing hover:shadow-md transition-all duration-200 border-gray-200 hover:border-blue-400"
    >
      <CardContent className="p-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-medium text-xs text-blue-600 truncate">
              {anomaly.num_equipments ? `#${anomaly.num_equipments.slice(-8)}` : '#N/A'}
            </span>
            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${getCriticalityColor(anomaly.criticite)}`} />
          </div>
          <div className="text-sm text-gray-900 font-medium truncate">
            {anomaly.descreption_anomalie || 'No description'}
          </div>
          <div className="text-xs text-gray-500 truncate">
            {anomaly.systeme || 'Unknown system'}
          </div>
        </div>
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

  // Handle ORPHANS special case
  const isOrphans = window.titlte === "ORPHANS";
  
  const formatProfessionalDate = (dateStart: string | null, dateEnd: string | null) => {
    if (!dateStart || !dateEnd) return "No dates assigned";
    
    const from = new Date(dateStart);
    const to = new Date(dateEnd);
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
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden transition-all duration-200 w-[360px] flex-shrink-0">
      {/* Header */}
      <div className={`p-4 border-b border-gray-200 relative ${isOrphans ? 'bg-blue-50' : 'bg-white'}`}>
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
          <h3 className="font-semibold text-black text-lg">
            {isOrphans ? "Unassigned Anomalies" : window.titlte}
          </h3>
          {!isOrphans && window.duree_jour && (
            <Badge variant="outline" className="text-xs">
              {window.duree_jour} day{window.duree_jour !== "1" ? 's' : ''}
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-2 text-sm text-gray-700 mb-1">
          <Clock className="h-3 w-3" />
          <span>{formatProfessionalDate(window.date_debut_arret, window.date_fin_arret)}</span>
        </div>
        
        {!isOrphans && window.duree_heure && (
          <p className="text-sm text-gray-600">
            Duration: {window.duree_heure} hours total
          </p>
        )}
      </div>

      {/* Content Area */}
      <div 
        ref={setNodeRef}
        className={`min-h-[160px] p-4 transition-all duration-200 ${
          isOver 
            ? 'bg-blue-50 border-t-2 border-blue-400' 
            : 'bg-white'
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium text-gray-700">Anomalies</h4>
          <span className="bg-blue-50 text-blue-700 text-xs font-medium px-2 py-1 rounded">
            {assignedAnomalies.length}
          </span>
        </div>
        
        <div className="space-y-1.5 min-h-[120px]">
          {assignedAnomalies.map((anomaly) => (
            <DraggableAnomaly key={anomaly.id} anomaly={anomaly} isInWindow={true} />
          ))}
          {assignedAnomalies.length === 0 && (
            <div className="flex items-center justify-center h-20 text-center">
              <div className="text-gray-400 text-sm">Drop anomalies here</div>
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
    title: '',
    start_date: '',
    end_date: '',
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

  // Calculate duration between dates
  const calculateDuration = (startDate: string, endDate: string) => {
    if (!startDate || !endDate) return { days: 0, hours: 0 };
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (end <= start) return { days: 0, hours: 0 };
    
    const diffInMs = end.getTime() - start.getTime();
    const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));
    const totalHours = diffInDays * 24; // Simple calculation: days * 24 hours
    
    return { days: diffInDays, hours: totalHours };
  };

  const duration = calculateDuration(newWindow.start_date, newWindow.end_date);

  const handleAddWindow = () => {
    if (!newWindow.title || !newWindow.start_date || !newWindow.end_date) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Create ISO datetime strings with standard working hours (08:00 to 18:00)
    const startDateTime = `${newWindow.start_date}T08:00:00Z`;
    const endDateTime = `${newWindow.end_date}T18:00:00Z`;

    const windowData = {
      date_debut_arret: startDateTime,
      date_fin_arret: endDateTime,
      titlte: newWindow.title, // Note: typo maintained as per backend requirement
      duree_jour: duration.days.toString(),
      duree_heure: duration.hours.toString(),
    };

    createMaintenanceWindow.mutate(windowData, {
      onSuccess: () => {
        toast.success("Maintenance window created successfully");
        setNewWindow({
          title: '',
          start_date: '',
          end_date: '',
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
    if (!anomaliesData?.anomalies || !Array.isArray(anomaliesData.anomalies)) return [];
    return anomaliesData.anomalies.filter(anomaly => anomaly.maintenance_window_id === windowId);
  };

  const getUnassignedAnomalies = (): Anomaly[] => {
    if (!anomaliesData?.anomalies || !Array.isArray(anomaliesData.anomalies)) return [];
    
    // Get anomalies that are either truly unassigned OR assigned to ORPHANS window
    const maintenanceWindows = maintenanceWindowsData?.maintenanceWindows;
    const orphansWindow = Array.isArray(maintenanceWindows) 
      ? maintenanceWindows.find(w => w.titlte === "ORPHANS")
      : undefined;
    const orphansAnomalies = orphansWindow ? getAssignedAnomalies(orphansWindow.id) : [];
    const trulyUnassigned = anomaliesData.anomalies.filter(anomaly => !anomaly.maintenance_window_id);
    
    return [...trulyUnassigned, ...orphansAnomalies];
  };

  const activeAnomaly = anomaliesData?.anomalies?.find(anomaly => anomaly.id === activeId);

  // Sort maintenance windows by date, excluding ORPHANS (handled separately)
  const maintenanceWindows = maintenanceWindowsData?.maintenanceWindows;
  const sortedMaintenanceWindows = Array.isArray(maintenanceWindows)
    ? maintenanceWindows
        .filter(window => window.titlte !== "ORPHANS") // Exclude ORPHANS from timeline
        .sort((a, b) => {
          // Sort by start date
          if (!a.date_debut_arret || !b.date_debut_arret) return 0;
          return new Date(a.date_debut_arret).getTime() - new Date(b.date_debut_arret).getTime();
        })
    : [];

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
      <div className="bg-white flex flex-col h-full">

        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Maintenance Windows</h1>
              {isLoadingWindows || isLoadingAnomalies ? (
                <div className="flex items-center gap-2 mt-2">
                  <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                  <span className="text-sm text-gray-500">Loading...</span>
                </div>
              ) : (
                <p className="text-sm text-gray-600 mt-1">
                  {sortedMaintenanceWindows?.length || 0} windows • {getUnassignedAnomalies().length} unassigned
                </p>
              )}
            </div>
            <div className="flex gap-3">
              <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="text-blue-600 border-blue-200 hover:bg-blue-50">
                    <Upload className="h-4 w-4 mr-2" />
                    Import
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[400px]">
                  <DialogHeader>
                    <DialogTitle>Import Maintenance Windows</DialogTitle>
                  </DialogHeader>
                  <div className="py-6">
                    <div className="border-2 border-dashed border-blue-200 rounded-lg p-8 text-center">
                      <FileUp className="h-12 w-12 text-blue-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-4">Upload Excel file</p>
                      <input
                        type="file"
                        accept=".xlsx,.xls"
                        onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                        className="hidden"
                        id="file-upload"
                      />
                      <label
                        htmlFor="file-upload"
                        className="cursor-pointer bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-block"
                      >
                        Choose File
                      </label>
                      {uploadFile && (
                        <div className="mt-3 text-sm text-gray-700 font-medium">
                          {uploadFile.name}
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
                  <div className="space-y-6 py-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={newWindow.title}
                        onChange={(e) => setNewWindow(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Maintenance Window Title"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Start Date *</label>
                        <input
                          type="date"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          value={newWindow.start_date}
                          onChange={(e) => setNewWindow(prev => ({ ...prev, start_date: e.target.value }))}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">End Date *</label>
                        <input
                          type="date"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          value={newWindow.end_date}
                          onChange={(e) => setNewWindow(prev => ({ ...prev, end_date: e.target.value }))}
                        />
                      </div>
                    </div>

                    {(newWindow.start_date && newWindow.end_date) && (
                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-700">Duration</span>
                          <span className="text-sm font-medium text-blue-900">
                            {duration.days} day{duration.days !== 1 ? 's' : ''} • {duration.hours} hours
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-3 mt-6">
                    <Button 
                      onClick={handleAddWindow} 
                      disabled={!newWindow.title || !newWindow.start_date || !newWindow.end_date || createMaintenanceWindow.isPending}
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

        {/* Maintenance Windows Timeline */}
        <div className="bg-white p-6 flex-1 flex flex-col select-none max-w-full overflow-hidden">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Maintenance Windows</h2>
          <div className="relative h-full w-full max-w-full">
            {/* Navigation Arrows */}
            {canScrollLeft && (
              <Button
                variant="outline"
                size="icon"
                className="absolute left-2 top-1/2 -translate-y-1/2 z-20 h-8 w-8 rounded-full bg-white border-gray-300 hover:bg-blue-50 hover:border-blue-400"
                onClick={scrollLeft}
              >
                <ChevronLeft className="h-4 w-4 text-gray-600" />
              </Button>
            )}
            
            {canScrollRight && (
              <Button
                variant="outline"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 z-20 h-8 w-8 rounded-full bg-white border-gray-300 hover:bg-blue-50 hover:border-blue-400"
                onClick={scrollRight}
              >
                <ChevronRight className="h-4 w-4 text-gray-600" />
              </Button>
            )}

            {/* Scrollable Container */}
            <div
              ref={scrollContainerRef}
              className="flex gap-4 overflow-x-auto scroll-smooth h-full pb-4"
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
                <div className="flex items-center justify-center w-full h-64">
                  <div className="text-center">
                    <CalendarIcon className="h-10 w-10 text-blue-400 mx-auto mb-3" />
                    <p className="text-gray-600">No maintenance windows scheduled</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Unassigned Anomalies - Always show this section */}
        <div className="bg-white border-t border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Unassigned Anomalies</h2>
            <span className="text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
              {getUnassignedAnomalies().length} pending
            </span>
          </div>
          {getUnassignedAnomalies().length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3">
              {getUnassignedAnomalies().map((anomaly) => (
                <DraggableAnomaly key={anomaly.id} anomaly={anomaly} />
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-32 text-center">
              <div className="text-gray-400">No unassigned anomalies</div>
            </div>
          )}
        </div>

        <DragOverlay>
          {activeAnomaly ? (
            <div className="bg-white rounded-lg border-2 border-blue-500 shadow-lg p-4 min-w-[200px] max-w-[300px]">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-xs text-blue-600 truncate">
                    {activeAnomaly.num_equipments ? `#${activeAnomaly.num_equipments.slice(-8)}` : '#N/A'}
                  </span>
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    !activeAnomaly.criticite ? "bg-gray-400" :
                    parseFloat(activeAnomaly.criticite) >= 13 ? "bg-red-500" : 
                    parseFloat(activeAnomaly.criticite) >= 10 ? "bg-orange-500" : 
                    parseFloat(activeAnomaly.criticite) >= 7 ? "bg-yellow-500" : "bg-green-500"
                  }`} />
                </div>
                <div className="text-sm text-gray-900 font-medium truncate">
                  {activeAnomaly.descreption_anomalie || 'No description'}
                </div>
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </div>
    </DndContext>
  );
}