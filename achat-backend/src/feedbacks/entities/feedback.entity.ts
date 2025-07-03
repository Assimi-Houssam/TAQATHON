import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { Company } from 'src/companies/entities/company.entity';
import { Bid } from 'src/bids/entities/bid.entity';
import { PurchaseRequest } from 'src/purchase-requests/entities/purchase-request.entity';

@Entity('feedbacks')
export class Feedback {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  description: string;

  @Column({ default: 0 })
  rating: number;

  @ManyToOne(() => Company, (company) => company.feedbacks_received)
  supplier: Company;

  @ManyToOne(() => PurchaseRequest)
  purchase_request: PurchaseRequest;

  @ManyToOne(() => User, (agent) => agent.feedbacks_given)
  agent: User;

  @OneToOne(() => Bid, (bid) => bid.feedback)
  @JoinColumn()
  bid: Bid;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
