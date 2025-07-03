import { User } from "./User.interface";

export interface Task {
  id: number;
  title: string;
  description?: string;
  completed: boolean;
  user: User;
  createdAt: Date;
  updatedAt: Date;
} 