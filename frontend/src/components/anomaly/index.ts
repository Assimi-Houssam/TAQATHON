// Anomaly component exports
export { AnomalyStatus } from "./AnomalyStatusBadge";
export { AnomalyCriticalityIndicator } from "./AnomalyCriticalityIndicator";
export { AnomalyTimeline } from "./AnomalyTimeline";

// Re-export types for convenience
export type { 
  Anomaly, 
  AnomalyStatus as AnomalyStatusType, 
  AnomalyCriticality, 
  AnomalyDisplay,
  AnomalyFormData,
  AnomalyUpdateData
} from "@/types/anomaly"; 

// New anomaly profile components
export { AnomalyProfile } from './AnomalyProfile';
export { AnomalySummary } from './AnomalySummary';
export { NewTabContent } from './NewTabContent';
export { InProgressTabContent } from './InProgressTabContent';
export { ClosedTabContent } from './ClosedTabContent'; 