import { Bid, Message, User } from "./index";
import { ChatType } from "./enums/index.enum";

export interface Chat {
  id: number;
  chat_name: string;
  chat_type: ChatType;
  chat_description: string;
  bid?: Bid;
  messages: Message[];
  chat_members?: User[];
  last_message?: Message;
  is_locked?: boolean;
  created_by?: number;
  created_at?: Date;
  updated_at?: Date;
}
