// Anomaly Management Types - Updated to match new interface specification

export interface User {
  id: string;
  email: string;
  name?: string;
  password: string;
}

export interface Equipement {
  id: string;
  name?: string;
  location?: string;
  tag_number?: string;
  description: string;
  anomalies?: Anomaly[];
}

export interface Attachments {
  id: string;
  file_name?: string;
  file_path?: string;
  anomalies: Anomaly[];
}

export interface RexEntrie {
  id: string;
  summary?: string;
  docment_path?: string;
  anomalies?: Anomaly[];
}

// Main Anomaly interface - aligned with new specification
export interface Anomaly {
  id: string;
  code?: string;
  equipment: string;
  description: string;
  date_apparition: string; // ISO date

  // Criticality assessment (1-5 each, total 1-15)
  process_safety: number; // 1-5
  fiabilite_integrite: number; // 1-5
  disponibilite: number; // 1-5
  criticality: number; // 1-15 (sum of the three factors)

  origin?: string;

  // Lifecycle status
  status: 
    | 'Pending_Feedback'
    | 'Pending_Scheduling'
    | 'Scheduled'
    | 'Resolved'
    | 'Closed';

  // Status tracking fields
  feedback_at?: string;
  scheduling_ready_at?: string;
  scheduled_at?: string;
  resolved_at?: string;
  closed_at?: string;

  created_at: string;
  updated_at: string;
}

// Legacy interface for backward compatibility during migration
export interface LegacyAnomaly {
  id: string;
  num_equipments: string;
  unite?: string;
  systeme?: string;
  descreption_anomalie?: string;
  date_detection: Date;
  origine?: string;
  section_proprietaire?: string;
  fiablite_integrite?: string;
  disponsibilite?: string;
  process_safty?: string;
  Criticite?: string;
  equipement_id?: string;
  equipement?: Equipement;
  atachments_id?: string;
  atachments?: Attachments;
  rex_id?: string;
  rex_entrie?: RexEntrie;
}

// UI-specific types
export type AnomalyStatus = 
  | 'Pending_Feedback'
  | 'Pending_Scheduling'
  | 'Scheduled'
  | 'Resolved'
  | 'Closed';

export type AnomalyCriticality = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

// Status transition rules
export const STATUS_TRANSITIONS: Record<AnomalyStatus, AnomalyStatus[]> = {
  'Pending_Feedback': ['Pending_Scheduling', 'Closed'],
  'Pending_Scheduling': ['Scheduled', 'Pending_Feedback'],
  'Scheduled': ['Resolved', 'Pending_Scheduling'],
  'Resolved': ['Closed', 'Pending_Scheduling'],
  'Closed': []
};

// Criticality calculation helpers (1-15 scale)
export const calculateCriticality = (
  process_safety: number,
  fiabilite_integrite: number,
  disponibilite: number
): number => {
  return process_safety + fiabilite_integrite + disponibilite;
};

export const getCriticalityLevel = (criticality: number): AnomalyCriticality => {
  if (criticality >= 13) return 'CRITICAL'; // 13-15
  if (criticality >= 10) return 'HIGH';     // 10-12
  if (criticality >= 7) return 'MEDIUM';    // 7-9
  return 'LOW';                             // 3-6
};

// Status helpers - simplified with black text
export const getStatusColor = (status: AnomalyStatus): string => {
  return 'text-zinc-900';
};

export const getStatusLabel = (status: AnomalyStatus): string => {
  switch (status) {
    case 'Pending_Feedback': return 'Pending Feedback';
    case 'Pending_Scheduling': return 'Pending Scheduling';
    case 'Scheduled': return 'Scheduled';
    case 'Resolved': return 'Resolved';
    case 'Closed': return 'Closed';
    default: return status;
  }
};

// For display purposes with computed fields
export interface AnomalyDisplay extends Anomaly {
  criticality_level: AnomalyCriticality;
  status_color: string;
  status_label: string;
  days_since_creation: number;
  equipment_tag?: string;
}

// Form interfaces
export interface AnomalyFormData {
  equipment: string;
  description: string;
  date_apparition: string;
  process_safety: number; // 1-5
  fiabilite_integrite: number; // 1-5
  disponibilite: number; // 1-5
  origin?: string;
  code?: string;
}

export interface AnomalyUpdateData {
  description?: string;
  process_safety?: number; // 1-5
  fiabilite_integrite?: number; // 1-5
  disponibilite?: number; // 1-5
  origin?: string;
} 