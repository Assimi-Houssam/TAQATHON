export interface DashboardMetrics {
  companies: {
    total: number;
    active: number;
  };
  suppliers: {
    total: number;
    active: number;
  };
  agents: {
    total: number;
    active: number;
  };
  bids: {
    total: number;
    closed: number;
    won: number;
    pending: number;
    rejected: number;
  };
  purchaseRequests: {
    closed: number;
    won: number;
    pending: number;
    rejected: number;
  };
}

export interface DepartmentData {
  name: string;
  requests: number;
  percentage: number;
}

export interface AgentDashboardData {
  metrics: DashboardMetrics;
  departments: DepartmentData[];
}
