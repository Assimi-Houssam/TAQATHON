"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle,
  Clock,
  CheckCircle2,
  Circle,
  PlayCircle,
  AlertCircle,
  ClipboardList,
  Calendar,
  User,
  Building,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface AnomalyTask {
  id: string;
  title: string;
  description: string;
  priority: "low" | "medium" | "high" | "critical";
  status: "pending" | "in_progress" | "completed";
  assignee: string;
  department: string;
  createdAt: string;
  dueDate: string;
  anomalyId?: string;
  type: "investigation" | "maintenance" | "calibration" | "repair" | "review";
}

interface AnomalyTasksListProps {
  className?: string;
  tasks: AnomalyTask[];
  onTaskUpdate?: (taskId: string, updates: Partial<AnomalyTask>) => void;
}

const getPriorityColor = (priority: AnomalyTask['priority']) => {
  switch (priority) {
    case 'low':
      return 'bg-blue-100 text-blue-800';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800';
    case 'high':
      return 'bg-orange-100 text-orange-800';
    case 'critical':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getStatusIcon = (status: AnomalyTask['status']) => {
  switch (status) {
    case 'pending':
      return <Circle className="h-4 w-4 text-gray-400" />;
    case 'in_progress':
      return <PlayCircle className="h-4 w-4 text-blue-500" />;
    case 'completed':
      return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    default:
      return <Circle className="h-4 w-4 text-gray-400" />;
  }
};

const getTypeIcon = (type: AnomalyTask['type']) => {
  switch (type) {
    case 'investigation':
      return <AlertTriangle className="h-4 w-4 text-orange-500" />;
    case 'maintenance':
      return <Building className="h-4 w-4 text-blue-500" />;
    case 'calibration':
      return <AlertCircle className="h-4 w-4 text-purple-500" />;
    case 'repair':
      return <AlertTriangle className="h-4 w-4 text-red-500" />;
    case 'review':
      return <ClipboardList className="h-4 w-4 text-gray-500" />;
    default:
      return <ClipboardList className="h-4 w-4 text-gray-500" />;
  }
};

const TaskItem = ({ 
  task, 
  onTaskUpdate,
  onTaskClick 
}: { 
  task: AnomalyTask; 
  onTaskUpdate?: (taskId: string, updates: Partial<AnomalyTask>) => void;
  onTaskClick?: (task: AnomalyTask) => void;
}) => {
  const handleStatusChange = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onTaskUpdate) {
      const newStatus = task.status === 'pending' ? 'in_progress' : 
                       task.status === 'in_progress' ? 'completed' : 'pending';
      onTaskUpdate(task.id, { status: newStatus });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric'
    });
  };

  const isOverdue = new Date(task.dueDate) < new Date() && task.status !== 'completed';

  return (
    <div
      className={cn(
        "flex items-center gap-3 py-2 px-3 rounded-md transition-colors cursor-pointer",
        "hover:bg-gray-50 border-b border-gray-100 last:border-b-0",
        task.status === 'completed' && "opacity-60"
      )}
      onClick={() => onTaskClick?.(task)}
    >
      <button
        onClick={handleStatusChange}
        className="flex-shrink-0 text-gray-400 hover:text-blue-500 transition-colors"
      >
        {getStatusIcon(task.status)}
      </button>
      
      <div className="flex-1 min-w-0 flex items-center gap-3">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {getTypeIcon(task.type)}
          <span
            className={cn(
              "font-medium text-sm truncate",
              task.status === 'completed' ? "line-through text-gray-500" : "text-gray-900"
            )}
          >
            {task.title}
          </span>
        </div>
        
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className={cn(
            "w-2 h-2 rounded-full",
            task.priority === 'critical' && "bg-red-500",
            task.priority === 'high' && "bg-orange-500",
            task.priority === 'medium' && "bg-yellow-500",
            task.priority === 'low' && "bg-green-500"
          )} />
          
          {isOverdue && (
            <span className="text-xs text-red-600 font-medium">OVERDUE</span>
          )}
          
          <span className="text-xs text-gray-500">{task.assignee}</span>
          <span className="text-xs text-gray-400">{formatDate(task.dueDate)}</span>
        </div>
      </div>
    </div>
  );
};

const TaskDetailsDialog = ({ 
  task, 
  open, 
  onClose,
  onTaskUpdate 
}: { 
  task: AnomalyTask | null; 
  open: boolean; 
  onClose: () => void;
  onTaskUpdate?: (taskId: string, updates: Partial<AnomalyTask>) => void;
}) => {
  if (!task) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isOverdue = new Date(task.dueDate) < new Date() && task.status !== 'completed';

  const handleStatusChange = () => {
    if (onTaskUpdate) {
      const newStatus = task.status === 'pending' ? 'in_progress' : 
                       task.status === 'in_progress' ? 'completed' : 'pending';
      onTaskUpdate(task.id, { status: newStatus });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="text-base flex items-center gap-2">
            {getTypeIcon(task.type)}
            {task.title}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-3">
          {/* Status and Priority Row */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleStatusChange}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600"
            >
              {getStatusIcon(task.status)}
              <span className="capitalize">{task.status.replace('_', ' ')}</span>
            </button>
            
            <span className={cn(
              "w-2 h-2 rounded-full",
              task.priority === 'critical' && "bg-red-500",
              task.priority === 'high' && "bg-orange-500",
              task.priority === 'medium' && "bg-yellow-500",
              task.priority === 'low' && "bg-green-500"
            )} />
            <span className="text-sm text-gray-600 capitalize">{task.priority}</span>
            
            {isOverdue && (
              <span className="text-xs text-red-600 font-medium">OVERDUE</span>
            )}
          </div>

          {/* Description */}
          {task.description && (
            <div className="border-t pt-3">
              <p className="text-sm text-gray-600">{task.description}</p>
            </div>
          )}

          {/* Details */}
          <div className="border-t pt-3 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Assignee</span>
              <span className="text-gray-900">{task.assignee}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Department</span>
              <span className="text-gray-900">{task.department}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Due</span>
              <span className="text-gray-900">{formatDate(task.dueDate)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Type</span>
              <span className="text-gray-900 capitalize">{task.type}</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export const AnomalyTasksList = ({ className, tasks, onTaskUpdate }: AnomalyTasksListProps) => {
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'in_progress' | 'completed'>('all');
  const [filterPriority, setFilterPriority] = useState<'all' | 'low' | 'medium' | 'high' | 'critical'>('all');
  const [selectedTask, setSelectedTask] = useState<AnomalyTask | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleTaskClick = (task: AnomalyTask) => {
    setSelectedTask(task);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedTask(null);
  };

  const filteredTasks = tasks.filter(task => {
    const statusMatch = filterStatus === 'all' || task.status === filterStatus;
    const priorityMatch = filterPriority === 'all' || task.priority === filterPriority;
    return statusMatch && priorityMatch;
  });

  const sortedTasks = filteredTasks.sort((a, b) => {
    // Sort by priority first (critical > high > medium > low)
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
    if (priorityDiff !== 0) return priorityDiff;
    
    // Then by status (pending > in_progress > completed)
    const statusOrder = { pending: 0, in_progress: 1, completed: 2 };
    const statusDiff = statusOrder[a.status] - statusOrder[b.status];
    if (statusDiff !== 0) return statusDiff;
    
    // Finally by due date
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });

  if (!tasks.length) {
    return (
      <Card className={cn("bg-white/90 backdrop-blur-xl", className)}>
        <CardContent className="p-8 text-center">
          <ClipboardList className="w-8 h-8 text-gray-400 mx-auto mb-3" />
          <h3 className="text-sm font-medium text-gray-900 mb-1">
            No tasks
          </h3>
          <p className="text-xs text-gray-500">
            Tasks will appear here when anomalies are detected
          </p>
        </CardContent>
      </Card>
    );
  }

  const statusCounts = {
    pending: tasks.filter(t => t.status === 'pending').length,
    in_progress: tasks.filter(t => t.status === 'in_progress').length,
    completed: tasks.filter(t => t.status === 'completed').length,
  };

  const filterButtons = [
    { value: 'all', label: 'All', count: tasks.length },
    { value: 'pending', label: 'Pending', count: statusCounts.pending },
    { value: 'in_progress', label: 'Active', count: statusCounts.in_progress },
    { value: 'completed', label: 'Done', count: statusCounts.completed },
  ];

  const priorityOptions = ['all', 'critical', 'high', 'medium', 'low'];

  return (
    <>
      <Card className={cn("bg-white/90 backdrop-blur-xl", className)}>
        <CardContent className="p-0 pt-4">
          {/* Filter Section - Single Line */}
          <div className="px-4 mb-3 flex items-center gap-3 border-b border-gray-100 pb-3">
            {/* Status Filter Tabs */}
            <div className="flex items-center gap-1">
              {filterButtons.map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => setFilterStatus(filter.value as 'all' | 'pending' | 'in_progress' | 'completed')}
                  className={cn(
                    "px-2 py-1 text-xs rounded transition-colors",
                    filterStatus === filter.value
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  )}
                >
                  {filter.label} {filter.count > 0 && `(${filter.count})`}
                </button>
              ))}
            </div>

            <div className="w-px h-4 bg-gray-200" />

            {/* Priority Filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Priority:</span>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value as 'all' | 'low' | 'medium' | 'high' | 'critical')}
                className="text-xs border-0 bg-transparent focus:outline-none text-gray-700"
              >
                {priorityOptions.map((option) => (
                  <option key={option} value={option}>
                    {option === 'all' ? 'All' : option.charAt(0).toUpperCase() + option.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            
            {(filterStatus !== 'all' || filterPriority !== 'all') && (
              <>
                <div className="w-px h-4 bg-gray-200" />
                <button
                  onClick={() => {
                    setFilterStatus('all');
                    setFilterPriority('all');
                  }}
                  className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Clear
                </button>
              </>
            )}
          </div>

          {/* Tasks List */}
          <div className="h-[400px] overflow-y-auto">
            <div className="px-4">
              {sortedTasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onTaskUpdate={onTaskUpdate}
                  onTaskClick={handleTaskClick}
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Task Details Dialog */}
      <TaskDetailsDialog
        task={selectedTask}
        open={isDialogOpen}
        onClose={handleCloseDialog}
        onTaskUpdate={onTaskUpdate}
      />
    </>
  );
}; 