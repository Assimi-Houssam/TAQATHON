import { Bid } from 'src/bids/entities/bid.entity';
import { Feedback } from 'src/feedbacks/entities/feedback.entity';
import { Answer } from 'src/forms/entities/answer.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import {
  Certifications,
  CompanyApprovalStatus,
  CompanyStatus,
  LegalForms,
} from '../enums/company.enum';
import { Document } from 'src/documents/entities/doc.entity';
import { BusinessScope } from './business-scope.entity';

@Index('idx_company_legal_name', ['legal_name'], { unique: true })
@Index('idx_company_ICE', ['ICE'], { unique: true })
@Index('idx_company_email', ['email'], { unique: true })
@Entity('companies')
export class Company {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false, unique: true })
  legal_name: string;

  @Column({ nullable: false, unique: true })
  commercial_name: string;

  @Column({
    nullable: true,
    unique: true,
    length: 15,
  })
  ICE: string;

  @Column({ nullable: true, unique: true })
  CNSS: string;

  @ManyToOne(() => Document, (document) => document.id)
  @JoinColumn({ name: 'rc_document_id' })
  rc_doc: Document;

  @ManyToOne(() => Document, (document) => document.id)
  @JoinColumn({ name: 'platform_agreement_document_id' })
  platform_agreement_doc: Document;

  @ManyToOne(() => Document, (document) => document.id)
  @JoinColumn({ name: 'cnss_document_id' })
  legal_status_doc: Document;

  @ManyToOne(() => Document, (document) => document.id)
  @JoinColumn({ name: 'company_financial_document_id' })
  company_financial_doc: Document;

  @ManyToOne(() => Document, (document) => document.id)
  @JoinColumn({ name: 'certificates_document_id' })
  certificates: Document[];

  @Column({ nullable: true, unique: true })
  SIRET_number: string;

  @Column({ nullable: true, unique: true })
  VAT_number: string;

  @Column({ nullable: true, unique: true })
  TIN_number: string;

  @Column({ nullable: true, unique: true })
  industry_code: string;

  @Column({
    type: 'enum',
    enum: LegalForms,
  })
  legal_form: LegalForms;

  @Column({
    type: 'enum',
    enum: Certifications,
    array: true,
    nullable: true,
  })
  certifications: Certifications[];

  @Column({ nullable: true })
  company_phone: string;

  @Column({ nullable: true })
  company_2nd_phone: string;

  @Column({ nullable: false, unique: true })
  email: string;

  @Column({ nullable: true })
  website: string;

  @ManyToOne(() => Document, (document) => document.id)
  @JoinColumn({ name: 'logo_id' })
  logo: Document;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  country: string;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  postal_code: string;

  @Column({
    type: 'enum',
    enum: CompanyApprovalStatus,
    default: CompanyApprovalStatus.WAITING_APPROVAL,
  })
  approval_status: CompanyApprovalStatus;

  @Column({
    type: 'enum',
    enum: CompanyStatus,
    default: CompanyStatus.ACTIVE,
  })
  active_status: CompanyStatus;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'owner_id' })
  owner: User;

  @OneToMany(() => User, (user) => user.company)
  members: User[];

  @OneToMany(() => User, (user) => user.pending_company)
  pending_users: User[];

  @OneToMany(() => Bid, (bid) => bid.company)
  bids: Bid[];

  @OneToMany(() => Feedback, (feedback) => feedback.supplier)
  feedbacks_received: Feedback[];

  @OneToMany(() => Answer, (answer) => answer.company)
  answers: Answer[];

  @ManyToMany(() => BusinessScope, (businessScope) => businessScope.companies, {
    eager: true,
  })
  @JoinTable({
    name: 'company_business_scopes',
    joinColumn: {
      name: 'company_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'business_scope_id',
      referencedColumnName: 'id',
    },
  })
  business_scopes: BusinessScope[];

  @Column({ nullable: true })
  rejection_reason: string;

  @Column({ nullable: true })
  lock_reason: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'locked_by_id' })
  locked_by: User;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
