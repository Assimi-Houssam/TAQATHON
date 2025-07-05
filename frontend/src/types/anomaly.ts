// Anomaly Management Types - Based on provided schema

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
  anomalies?: Anomaly;
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
  anomalies?: Anomaly;
}

export interface Anomaly {
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
export type AnomalyCriticite = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type AnomalyStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";

// For display purposes with computed fields
export interface AnomalyDisplay extends Anomaly {
  status: AnomalyStatus; // Computed based on resolution state
  criticite_display: AnomalyCriticite; // Normalized criticite field
} 