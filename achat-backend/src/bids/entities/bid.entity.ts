import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToOne,
  Index,
} from 'typeorm';
import { Chat } from 'src/chats/entities/chat.entity';
import { User } from 'src/users/entities/user.entity';
import { PurchaseRequest } from 'src/purchase-requests/entities/purchase-request.entity';
import { Company } from 'src/companies/entities/company.entity';
import { Feedback } from 'src/feedbacks/entities/feedback.entity';
import { BidStatus } from '../enums/bids.enum';

@Index('bid_reference_idx', ['bid_reference'], { unique: true })
@Entity('bids')
export class Bid {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  bid_reference: string;

  @Column({
    type: 'enum',
    enum: BidStatus,
    default: BidStatus.PENDING,
  })
  bid_status: BidStatus;

  @Column()
  bid_description: string;

  @OneToOne(() => Chat, (chat) => chat.bid)
  chat: Chat;

  @Column()
  delivery_date: Date;

  @Column()
  delivery_address: string;

  @Column()
  biding_date: Date;

  @Column()
  biding_address: string;

  @OneToOne(() => Feedback, (feedback) => feedback.bid)
  feedback: Feedback;

  @ManyToOne(() => PurchaseRequest)
  purchase_request: PurchaseRequest;

  @ManyToOne(() => Company)
  company: Company;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
