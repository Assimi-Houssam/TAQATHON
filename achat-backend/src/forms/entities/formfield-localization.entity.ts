import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  UpdateDateColumn,
  CreateDateColumn,
} from 'typeorm';
import { FormField } from './formfield.entity';

@Entity()
export class FormFieldLocalization {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  locale: string;

  @Column()
  label: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ nullable: true })
  placeholder?: string;

  @Column({ nullable: true })
  tooltip?: string;

  @Column({ nullable: true })
  selectOptions?: string;

  @ManyToOne(() => FormField, (formField) => formField.localizations, {
    onDelete: 'CASCADE',
  })
  formField: FormField;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
