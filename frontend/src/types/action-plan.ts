export enum ActionPlanStatus {
  NOT_COMPLETED = "NOT_COMPLETED",
  COMPLETED = "COMPLETED"
}

// Database representation
export interface ActionPlan {
  id: string;
  Action?: string | null;
  responsable?: string | null;
  pdrs_disponible?: boolean | null;
  resource_intern?: string | null;
  resource_extern?: string | null;
  status?: ActionPlanStatus | null;
  anomaly_id?: string | null;
}

// Frontend representation (for ActionPlanTable compatibility)
export interface ActionPlanItem {
  id: string;
  action: string;
  responsible: string;
  pdrsAvailable: boolean;
  internalResources: string;
  externalResources: string;
  isDone: boolean;
}

// Form data for creating/updating action plans
export interface ActionPlanFormData {
  action: string;
  responsible: string;
  pdrsAvailable?: boolean;
  internalResources?: string;
  externalResources?: string;
  isDone?: boolean;
}

// Update data (partial)
export interface ActionPlanUpdateData {
  Action?: string;
  responsable?: string;
  pdrs_disponible?: boolean;
  resource_intern?: string;
  resource_extern?: string;
  status?: ActionPlanStatus;
}

// API Response types
export interface ActionPlansResponse {
  data: ActionPlan[];
  total?: number;
  totalPages?: number;
  currentPage?: number;
  hasNext?: boolean;
  hasPrevious?: boolean;
}

// Utility functions for data transformation
export function actionPlanToItem(actionPlan: ActionPlan): ActionPlanItem {
  return {
    id: actionPlan.id,
    action: actionPlan.Action || '',
    responsible: actionPlan.responsable || '',
    pdrsAvailable: actionPlan.pdrs_disponible || false,
    internalResources: actionPlan.resource_intern || '',
    externalResources: actionPlan.resource_extern || '',
    isDone: actionPlan.status === ActionPlanStatus.COMPLETED
  };
}

export function actionItemToPlan(item: ActionPlanItem, anomalyId?: string): ActionPlanUpdateData {
  return {
    Action: item.action,
    responsable: item.responsible,
    pdrs_disponible: item.pdrsAvailable,
    resource_intern: item.internalResources,
    resource_extern: item.externalResources,
    status: item.isDone ? ActionPlanStatus.COMPLETED : ActionPlanStatus.NOT_COMPLETED
  };
}

export function formDataToPlan(formData: ActionPlanFormData): ActionPlanUpdateData {
  return {
    Action: formData.action,
    responsable: formData.responsible,
    pdrs_disponible: formData.pdrsAvailable || false,
    resource_intern: formData.internalResources || '',
    resource_extern: formData.externalResources || '',
    status: formData.isDone ? ActionPlanStatus.COMPLETED : ActionPlanStatus.NOT_COMPLETED
  };
} 