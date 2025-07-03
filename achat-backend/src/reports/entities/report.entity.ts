import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Reply } from './reply.entity';
import { ReportStatus } from '../enums/report-status.enum';
import { User } from 'src/users/entities/user.entity';

@Index('report_reference_idx', ['report_reference'], { unique: true })
@Entity()
export class Report {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  report_reference: string;

  @Column()
  title: string;

  @Column()
  description: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'createdBy' })
  creator: User;

  @Column({
    type: 'enum',
    enum: ReportStatus,
    default: ReportStatus.OPEN,
  })
  status: ReportStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Reply, (reply) => reply.report)
  replies: Reply[];
}
