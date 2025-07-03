import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { FormFieldType } from '../enums/forms.enum';
import { Answer } from './answer.entity';
import { Form } from './form.entity';
import { FormFieldLocalization } from './formfield-localization.entity';

@Entity('formfields')
export class FormField {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  label: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ nullable: true })
  placeholder?: string;

  @Column({ nullable: true })
  tooltip?: string;

  @OneToMany(() => Answer, (answer) => answer.formfield)
  answers: Answer[];

  @Column({
    type: 'enum',
    enum: FormFieldType,
  })
  type: FormFieldType;

  @Column({ default: false })
  required: boolean;

  @Column('text', { nullable: true })
  selectOptions: string;

  @Column()
  order: number;

  @ManyToOne(() => Form, (forms) => forms.formfields, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  forms: Form;

  @Column({ nullable: true })
  maxLength?: number;

  @Column({ nullable: true })
  minLength?: number;

  @Column({ nullable: true })
  minValue?: number;

  @Column({ nullable: true })
  maxValue?: number;

  @Column({ nullable: true })
  step?: number;

  @Column({ nullable: true })
  pattern?: string;

  @Column({ type: 'date', nullable: true })
  minDate?: Date;

  @Column({ type: 'date', nullable: true })
  maxDate?: Date;

  @Column({ nullable: true })
  maxFileSize?: number;

  @Column('text', { nullable: true })
  allowedFileTypes?: string;

  @Column('jsonb', { nullable: true })
  arrayFields?: FormField[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(
    () => FormFieldLocalization,
    (localization) => localization.formField,
    { cascade: true },
  )
  localizations: FormFieldLocalization[];
}
