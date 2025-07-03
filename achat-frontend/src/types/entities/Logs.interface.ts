import { User } from "./User.interface";

export enum LogsType {
  FEEDBACK = "FEEDBACK",
  BID = "BID",
  PURCHASE_REQUEST = "PURCHASE_REQUEST",
  PROFILE = "PROFILE",
  COMPANY = "COMPANY",
  AUTH = "AUTH",
  CREATE_REPORT = "CREATE_REPORT",
  ADD_REPLY = "ADD_REPLY",
  UPDATE_REPORT = "UPDATE_REPORT",
}

export interface Log {
  id: number;
  action_type: LogsType;
  previous_status: string | null;
  action: string;
  user: User;
  created_at: Date;
  updated_at: Date;
}

export interface LogsResponse {
  logs: Log[];
  total: number;
}

export interface LogFilterParams {
  page: number;
  limit: number;
  actionType?: LogsType;
  startDate?: string;
  endDate?: string;
  userId?: number;
  search?: string;
}
