import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { LayoutDto } from '../dto/layout.dto';
import { FormField } from './formfield.entity';

@Entity('forms')
export class Form {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ default: false })
  isLocked: boolean;

  @OneToMany(() => FormField, (formfield) => formfield.forms)
  formfields: FormField[];

  @Column('jsonb', { nullable: true })
  layout: LayoutDto['layout'];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
