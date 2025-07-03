import { User } from 'src/users/entities/user.entity';
import { Message } from 'src/messages/entities/message.entity';
import { ChatType } from '../enums/chat.enum';

export class ChatDetailDto {
  id: number;
  chat_name: string;
  chat_type: ChatType;
  chat_description: string;
  chat_members: User[];
  lastMessage?: Message;
  created_at: Date;
  updated_at: Date;
}
