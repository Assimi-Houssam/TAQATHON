import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinTable,
  ManyToMany,
  Index,
  JoinColumn,
} from 'typeorm';
import {
  PRVisibilityType,
  PurchaseRequestStatus,
} from '../enums/purchase-request.enum';
import { User } from 'src/users/entities/user.entity';
import { Company } from 'src/companies/entities/company.entity';
import { Bid } from 'src/bids/entities/bid.entity';
import { Departement } from 'src/departements/entities/departement.entity';
import { Document } from 'src/documents/entities/doc.entity';
@Index('idx_request_code', ['request_code'], { unique: true })
@Entity('purchase_requests')
export class PurchaseRequest {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  request_code: string;

  @Column()
  title: string;

  @Column({ type: 'timestamp', nullable: true })
  bidding_deadline: Date;

  @Column({
    type: 'enum',
    enum: PurchaseRequestStatus,
  })
  status: PurchaseRequestStatus;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  category: string;

  @Column('enum', { enum: PRVisibilityType })
  purchase_visibility: PRVisibilityType;

  @Column({ type: 'timestamp', nullable: true })
  delivery_date: Date;

  @ManyToOne(() => Departement)
  buying_department: Departement;

  @Column({ nullable: true })
  delivery_address: string;

  @Column({ type: 'timestamp', nullable: true })
  biding_date: Date;

  @Column({ nullable: true })
  biding_address: string;

  @ManyToOne(() => User)
  owner: User;

  // @OneToMany(() => Document)
  // @JoinColumn({ name: 'purchase_request_id' })
  // attachments: Document[];

  @ManyToMany(() => Document)
  @JoinTable({ name: 'purchase_request_documents' })
  documents: Document[];

  @ManyToMany(() => User)
  @JoinTable({ name: 'purchase_request_agents' })
  agents: User[];

  @ManyToMany(() => Company)
  @JoinTable({ name: 'purchase_request_companies' })
  companies: Company[];

  @OneToMany(() => Bid, (bid) => bid.purchase_request)
  bids: Bid[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
