import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { NotificationType } from '../enums/notification.enum';
import { Bid } from 'src/bids/entities/bid.entity';
import { PurchaseRequest } from 'src/purchase-requests/entities/purchase-request.entity';

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  notification_type: NotificationType;

  @Column({ default: false })
  is_public: boolean;

  @ManyToMany(() => User, (user) => user.notifications)
  @JoinTable()
  users: User[];

  @Column()
  notification_message: string;

  @Column()
  notification_status: string;

  @ManyToOne(() => User, (user) => user.notifications, { nullable: true })
  creator: User;

  @ManyToOne(() => Bid)
  @JoinColumn({ name: 'bid_id' })
  bid: Bid;

  @ManyToOne(() => PurchaseRequest)
  @JoinColumn({ name: 'purchase_request_id' })
  purchase_request: PurchaseRequest;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
