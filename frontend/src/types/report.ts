import { Document } from "./entities/Document.interface";

export enum ReportStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
}

export type Report = {
  id: string;
  title: string;
  description: string;
  status: ReportStatus;
  createdAt: string;
  updatedAt: string;
  creator: {
    username: string;
  };
  replies?: Reply[];
};

export type Reply = {
  id: string;
  message: string;
  createdAt: string;
  creator: {
    username: string;
    avatar?: Document;
  };
};
