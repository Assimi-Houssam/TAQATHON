import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  OneToOne,
  ManyToMany,
  JoinTable,
  JoinColumn,
} from 'typeorm';

import { User } from 'src/users/entities/user.entity';
import { Message } from 'src/messages/entities/message.entity';
import { Bid } from 'src/bids/entities/bid.entity';
import { ChatType } from '../enums/chat.enum';
@Entity('chats')
export class Chat {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  chat_name: string;

  @Column()
  chat_type: ChatType;

  @Column()
  chat_description: string;

  @OneToOne(() => Bid, (bid) => bid.chat)
  @JoinColumn()
  bid: Bid;

  @OneToMany(() => Message, (message) => message.chat)
  messages: Message[];

  @ManyToMany(() => User, (user) => user.chats)
  @JoinTable()
  chat_members: User[];

  @Column({ default: false })
  is_locked: boolean;

  @Column()
  created_by: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
