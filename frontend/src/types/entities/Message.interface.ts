import { User } from './index';

export interface Message {
  id: number;
  content: string;
  sender: User;
  created_at: Date;
}
