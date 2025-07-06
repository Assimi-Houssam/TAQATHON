// KPI Interfaces for Dashboard Data
// These interfaces define the structure of data that will be received from the backend API

export interface SystemState {
  criticalIssues: number;
  allSystemsNormal: boolean;
  activeAnomalies: number;
  resolvedToday: number;
  avgResolutionTime: string;
  lastUpdated: string;
}

export interface AnomalyStatus {
  name: "New" | "In Progress" | "Resolved" | "Critical";
  value: number;
  color: string;
  percentage?: number;
}

export interface CriticalityDistribution {
  unit: string;
  low: number;
  medium: number;
  high: number;
  critical: number;
  total: number;
}

export interface AnomalyTrend {
  date: string;
  anomalies: number;
  resolved: number;
  critical: number;
  timestamp: string;
}

export interface AnomalyTask {
  id: string;
  title: string;
  description: string;
  priority: "low" | "medium" | "high" | "critical";
  status: "pending" | "in_progress" | "completed" | "cancelled";
  assignee: string;
  department: string;
  createdAt: string;
  dueDate: string;
  type: "investigation" | "calibration" | "repair" | "review" | "maintenance";
  estimatedHours?: number;
  actualHours?: number;
  equipment?: string;
  location?: string;
}

export interface DashboardMetric {
  title: string;
  value: string | number;
  subtitle: string;
  trend?: {
    value: number;
    direction: "up" | "down" | "stable";
    period: string;
  };
  color?: string;
  bgColor?: string;
  icon?: string;
}

export interface IndustrialUnit {
  id: string;
  name: string;
  location: string;
  status: "operational" | "maintenance" | "offline" | "critical";
  totalSensors: number;
  operationalSensors: number;
  efficiencyRate: number;
  lastMaintenance: string;
  nextMaintenance: string;
  anomalies: {
    active: number;
    resolved: number;
    critical: number;
  };
}

export interface NotificationAlert {
  id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "error" | "success";
  priority: "low" | "medium" | "high" | "critical";
  timestamp: string;
  isRead: boolean;
  actionRequired: boolean;
  relatedEntity?: {
    type: "unit" | "sensor" | "task" | "anomaly";
    id: string;
    name: string;
  };
}

export interface PerformanceMetrics {
  uptime: number; // percentage
  responseTime: number; // milliseconds
  throughput: number; // operations per hour
  errorRate: number; // percentage
  availability: number; // percentage
  mttr: number; // mean time to repair in hours
  mtbf: number; // mean time between failures in hours
}

export interface SensorData {
  id: string;
  name: string;
  type: "temperature" | "pressure" | "vibration" | "flow" | "level" | "ph" | "conductivity";
  unit: string;
  currentValue: number;
  normalRange: {
    min: number;
    max: number;
  };
  criticalRange: {
    min: number;
    max: number;
  };
  status: "normal" | "warning" | "critical" | "offline";
  lastReading: string;
  calibrationDate: string;
  nextCalibration: string;
  location: string;
  unitId: string;
}

export interface AnomalyDetails {
  id: string;
  title: string;
  description: string;
  severity: "low" | "medium" | "high" | "critical";
  category: "sensor" | "equipment" | "process" | "environmental";
  detectedAt: string;
  resolvedAt?: string;
  status: "new" | "investigating" | "in_progress" | "resolved" | "escalated";
  affectedSensors: string[];
  affectedUnits: string[];
  rootCause?: string;
  resolution?: string;
  assignedTo?: string;
  estimatedImpact: {
    financial: number;
    operational: "low" | "medium" | "high";
    safety: "low" | "medium" | "high";
  };
}

export interface ReportData {
  id: string;
  title: string;
  type: "daily" | "weekly" | "monthly" | "incident" | "maintenance";
  generatedAt: string;
  period: {
    start: string;
    end: string;
  };
  summary: {
    totalAnomalies: number;
    criticalIssues: number;
    resolved: number;
    pending: number;
    uptime: number;
  };
  details: {
    anomaliesByUnit: Record<string, number>;
    anomaliesByType: Record<string, number>;
    resolutionTimes: number[];
    trends: AnomalyTrend[];
  };
}

export interface DashboardFilter {
  timeRange: {
    start: string;
    end: string;
    preset?: "today" | "week" | "month" | "quarter" | "year";
  };
  units: string[];
  priorities: Array<"low" | "medium" | "high" | "critical">;
  statuses: Array<"new" | "in_progress" | "resolved" | "escalated">;
  categories: Array<"sensor" | "equipment" | "process" | "environmental">;
}

// API Response interfaces
export interface APIResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
  errors?: string[];
}

export interface DashboardAPIResponse {
  systemState: SystemState;
  metrics: DashboardMetric[];
  anomaliesByStatus: AnomalyStatus[];
  criticalityDistribution: CriticalityDistribution[];
  anomaliesOverTime: AnomalyTrend[];
  tasks: AnomalyTask[];
  units: IndustrialUnit[];
  notifications: NotificationAlert[];
  performance: PerformanceMetrics;
  lastUpdated: string;
}

// Utility types
export type AnomalyPriority = "low" | "medium" | "high" | "critical";
export type AnomalyStatusType = "pending" | "in_progress" | "completed" | "cancelled";
export type TaskType = "investigation" | "calibration" | "repair" | "review" | "maintenance";
export type UnitStatus = "operational" | "maintenance" | "offline" | "critical";
export type SensorStatus = "normal" | "warning" | "critical" | "offline";

// Chart data types
export interface ChartDataPoint {
  name: string;
  value: number;
  color?: string;
  [key: string]: string | number | undefined;
}

export interface TimeSeriesDataPoint {
  date: string;
  [key: string]: string | number;
}

export interface BarChartDataPoint {
  name: string;
  [key: string]: string | number;
} 