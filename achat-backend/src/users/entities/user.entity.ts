import { Chat } from 'src/chats/entities/chat.entity';
import { Company } from 'src/companies/entities/company.entity';
import { Document } from 'src/documents/entities/doc.entity';
import { Feedback } from 'src/feedbacks/entities/feedback.entity';
import { Notification } from 'src/notifications/entities/notification.entity';
import { PurchaseRequest } from 'src/purchase-requests/entities/purchase-request.entity';
import { Task } from 'src/tasks/entities/task.entity';
import { Role } from 'src/auth/entities/role.entity';
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
import { EntityTypes } from '../enums/user.enum';
import { Departement } from 'src/departements/entities/departement.entity';

@Index('username', ['username'], { unique: true })
@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  first_name: string;

  @Column()
  last_name: string;

  @Column({ nullable: true })
  full_name: string;

  @Column({ unique: true })
  username: string;

  @Column({ nullable: true })
  bio: string;

  @Column({ nullable: true })
  country: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true, select: false })
  password: string;

  @ManyToOne(() => Document, { nullable: true })
  @JoinColumn({ name: 'avatar_id' })
  avatar: Document;

  @Column({ type: 'enum', enum: EntityTypes })
  entity_type: EntityTypes;

  @Column({ length: 15, nullable: true })
  phone_number: string;

  @Column({ type: 'enum', enum: ['fr', 'en'], default: 'fr' })
  language: string;

  @Column({ nullable: true })
  title: string;

  @Column({ nullable: true })
  birth_date: Date;

  @Column({ nullable: true })
  postal_city: string;

  @Column({ nullable: true })
  postal_country: string;

  @OneToMany(() => PurchaseRequest, (purchaseRequest) => purchaseRequest.owner)
  purchase_requests: PurchaseRequest[];

  @ManyToMany(() => Chat, (chat) => chat.chat_members)
  chats: Chat[];

  @OneToMany(() => Notification, (notification) => notification.users)
  notifications: Notification[];

  @ManyToOne(() => Company, (company) => company.members)
  company: Company;

  @ManyToOne(() => Company, (company) => company.pending_users)
  pending_company: Company;

  @OneToMany(() => Feedback, (feedback) => feedback.agent)
  feedbacks_given: Feedback[];

  @Column({ default: true })
  is_active: boolean;

  @Column({ nullable: true })
  verification_token: string;

  @Column({ default: false })
  is_verified: boolean;

  @Column({ nullable: true })
  verification_expires: Date;

  @Column({ nullable: true })
  password_reset_token: string;

  @Column({ nullable: true })
  password_reset_expires: Date;

  @Column({ nullable: true })
  email_verification_token: string;

  @Column({ default: false })
  is_restricted: boolean;

  @Column({ nullable: true })
  restriction_date: Date;

  @Column({ default: 'offline' })
  status: string;

  @OneToMany(() => Task, (task) => task.user)
  tasks: Task[];

  @ManyToMany(() => Departement, (departement) => departement.users)
  @JoinTable()
  departements: Departement[];

  @ManyToMany(() => Role, (role) => role.users)
  @JoinTable({
    name: 'user_roles',
    joinColumn: { name: 'user_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'role_id', referencedColumnName: 'id' },
  })
  roles: Role[];

  @Column({ nullable: true })
  privilege_level: string;

  @Column({ nullable: true, select: false })
  two_factor_secret: string;

  @Column({ nullable: true, select: false })
  temp_2fa_secret: string;

  @Column({ default: false })
  two_factor_enabled: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
