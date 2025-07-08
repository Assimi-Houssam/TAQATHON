// Anomaly Management Types - Updated to match new AnomalieEntity specification

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

// Main Anomaly interface - aligned with AnomalieEntity specification
export interface Anomaly {
  id: string;
  num_equipments?: string;
  duree_intervention?: string;
  unite?: string;
  systeme?: string;
  descreption_anomalie?: string;
  origine?: 'ORACLE' | 'MAXIMO' | 'EMC' | 'APM';
  date_detection?: string;
  section_proprietaire?: string;
  fiablite_integrite?: string;
  fiablite_conf?: string;
  disponsibilite?: string;
  disponibilite_conf?: string;
  process_safty?: string;
  process_safty_conf?: string;
  Criticite?: string;
  status?: 'NEW' | 'IN_PROGRESS' | 'CLOSED';
  source?: 'MC' | 'MM' | 'MD' | 'CT' | 'EL';
  comment?: string;
  required_stoping?: boolean;
  resolution_date?: string;
  date_traitement?: string;
  trained?: boolean;
  maintenance_window_id?: string;
  created_at: Date;
  updated_at: Date;
}

// Type alias for the new entity structure
export type AnomalieEntity = Anomaly;

// Legacy interface for backward compatibility during migration
export interface LegacyAnomaly {
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
    | 'New'
    | 'In Progress'
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

// UI-specific types
export type AnomalyStatus = 'NEW' | 'IN_PROGRESS' | 'CLOSED';

export type AnomalyOrigin = 'ORACLE' | 'MAXIMO' | 'EMC' | 'APM';

export type AnomalySource = 'MC' | 'MM' | 'MD' | 'CT' | 'EL';

export type AnomalyCriticality = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

// Status transition rules
export const STATUS_TRANSITIONS: Record<AnomalyStatus, AnomalyStatus[]> = {
  'NEW': ['IN_PROGRESS', 'CLOSED'],
  'IN_PROGRESS': ['CLOSED'],
  'CLOSED': []
};

// Criticality calculation helpers - updated for string-based criticality
export const getCriticalityLevel = (criticite?: string): AnomalyCriticality => {
  if (!criticite) return 'LOW';
  
  const criticalityValue = parseFloat(criticite);
  if (isNaN(criticalityValue)) return 'LOW';
  
  if (criticalityValue >= 13) return 'CRITICAL'; // 13-15
  if (criticalityValue >= 10) return 'HIGH';     // 10-12
  if (criticalityValue >= 7) return 'MEDIUM';    // 7-9
  return 'LOW';                                  // 3-6
};

// Helper to calculate numeric criticality from string values
export const calculateCriticalityFromStrings = (
  fiablite_integrite?: string,
  disponsibilite?: string,
  process_safty?: string
): number => {
  const fiabilite = parseFloat(fiablite_integrite || '0') || 0;
  const disponibilite = parseFloat(disponsibilite || '0') || 0;
  const processSafety = parseFloat(process_safty || '0') || 0;
  
  return fiabilite + disponibilite + processSafety;
};

// Status helpers - simplified with black text
export const getStatusColor = (status?: AnomalyStatus): string => {
  return 'text-zinc-900';
};

export const getStatusLabel = (status?: AnomalyStatus): string => {
  switch (status) {
    case 'NEW': return 'New';
    case 'IN_PROGRESS': return 'In Progress';
    case 'CLOSED': return 'Closed';
    default: return status || 'Unknown';
  }
};

// Origin helpers
export const getOriginLabel = (origine?: AnomalyOrigin): string => {
  switch (origine) {
    case 'ORACLE': return 'Oracle';
    case 'MAXIMO': return 'Maximo';
    case 'EMC': return 'EMC';
    case 'APM': return 'APM';
    default: return origine || 'Unknown';
  }
};

// Source helpers
export const getSourceLabel = (source?: AnomalySource): string => {
  switch (source) {
    case 'MC': return 'MC';
    case 'MM': return 'MM';
    case 'MD': return 'MD';
    case 'CT': return 'CT';
    case 'EL': return 'EL';
    default: return source || 'Unknown';
  }
};

// For display purposes with computed fields
export interface AnomalyDisplay extends Anomaly {
  criticality_level: AnomalyCriticality;
  status_color: string;
  status_label: string;
  origin_label: string;
  source_label: string;
  days_since_creation: number;
  equipment_tag?: string;
  numeric_criticality: number;
}

// Form interfaces - updated for new structure
export interface AnomalyFormData {
  num_equipments?: string;
  duree_intervention?: string;
  unite?: string;
  systeme?: string;
  descreption_anomalie?: string;
  origine?: AnomalyOrigin;
  date_detection?: string;
  section_proprietaire?: string;
  fiablite_integrite?: string;
  fiablite_conf?: string;
  disponsibilite?: string;
  disponibilite_conf?: string;
  process_safty?: string;
  process_safty_conf?: string;
  source?: AnomalySource;
  comment?: string;
  required_stoping?: boolean;
}

export interface AnomalyUpdateData {
  descreption_anomalie?: string;
  fiablite_integrite?: string;
  fiablite_conf?: string;
  disponsibilite?: string;
  disponibilite_conf?: string;
  process_safty?: string;
  process_safty_conf?: string;
  comment?: string;
  required_stoping?: boolean;
  status?: AnomalyStatus;
  resolution_date?: string;
  date_traitement?: string;
  trained?: boolean;
}

// Action Plan interface
export interface ActionPlan {
  id: string;
  title: string;
  description: string;
  file_link?: string;
  anomaly_id: string;
  created_at: string;
  updated_at: string;
}

// Maintenance Window interface
export interface MaintenanceWindow {
  id: string;
  anomaly_id: string;
  scheduled_start: string;
  scheduled_end: string;
  assigned_team?: string;
  notes?: string;
  duration_of_intervention?: number; // in hours
  requires_stopping?: boolean;
  created_at: string;
  updated_at: string;
}

// REX (Return of Experience) interface
export interface REX {
  id: string;
  anomaly_id: string;
  notes: string;
  file_path?: string;
  lessons_learned?: string;
  created_by: string;
  created_at: string;
}

// Extended Anomaly interface with related data
export interface AnomalyWithRelations extends Anomaly {
  action_plans?: ActionPlan[];
  maintenance_window?: MaintenanceWindow;
  rex?: REX;
}

// Migration helpers for converting between old and new formats
export const convertLegacyToNew = (legacy: LegacyAnomaly): Anomaly => {
  return {
    id: legacy.id,
    num_equipments: legacy.equipment,
    descreption_anomalie: legacy.description,
    date_detection: legacy.date_apparition,
    fiablite_integrite: legacy.fiabilite_integrite?.toString(),
    disponsibilite: legacy.disponibilite?.toString(),
    process_safty: legacy.process_safety?.toString(),
    Criticite: legacy.criticality?.toString(),
    status: legacy.status === 'New' ? 'NEW' : 
            legacy.status === 'In Progress' ? 'IN_PROGRESS' : 'CLOSED',
    origine: legacy.origin as AnomalyOrigin,
    created_at: new Date(legacy.created_at),
    updated_at: new Date(legacy.updated_at),
  };
}; 