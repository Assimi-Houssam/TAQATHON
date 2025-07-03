import { MigrationInterface, QueryRunner } from 'typeorm';
import { FormFieldType } from '../../forms/enums/forms.enum';

export class CreateLeaveRequestForm1710000000003 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO forms (
        name,
        description,
        "createdAt",
        "updatedAt"
      )
      VALUES (
        'leave-request',
        'Leave Request Form',
        NOW(),
        NOW()
      )
      RETURNING id;
    `);

    const formfieldsList = [
      {
        label: 'Leave Type',
        description: 'Type of leave you are requesting',
        type: FormFieldType.SELECT,
        selectOptions: [
          'Annual Leave',
          'Sick Leave',
          'Personal Leave',
          'Maternity/Paternity',
          'Bereavement',
          'Other',
        ],
        required: true,
        order: 1,
      },
      {
        label: 'Start Date',
        description: 'First day of leave',
        type: FormFieldType.DATE,
        required: true,
        order: 2,
      },
      {
        label: 'End Date',
        description: 'Last day of leave',
        type: FormFieldType.DATE,
        required: true,
        order: 3,
      },
      {
        label: 'Half Day Option',
        description: 'Are you taking half day on start or end date?',
        type: FormFieldType.SELECT,
        selectOptions: ['No', 'Half Day Start', 'Half Day End'],
        required: true,
        order: 4,
      },
      {
        label: 'Total Days',
        description: 'Total number of leave days',
        type: FormFieldType.NUMBER,
        required: true,
        order: 5,
      },
      {
        label: 'Handover Notes',
        description: 'Important information for your team during your absence',
        type: FormFieldType.TEXTAREA,
        required: false,
        order: 6,
      },
      {
        label: 'Emergency Contact',
        description: 'Contact number during leave',
        type: FormFieldType.PHONE,
        required: true,
        order: 7,
      },
      {
        label: 'Supporting Documents',
        description:
          'Upload any supporting documents (e.g., medical certificate)',
        type: FormFieldType.FILE,
        required: false,
        order: 8,
      },
    ];

    await queryRunner.query(`
      INSERT INTO formfields (
        label, 
        description, 
        type, 
        required, 
        "order", 
        "formsId", 
        "createdAt", 
        "updatedAt"
      ) 
      SELECT 
        q.label, 
        q.description, 
        q.type::formfields_type_enum, 
        q.required, 
        q.order, 
        qs.id,
        NOW(), 
        NOW()
      FROM (
        VALUES ${formfieldsList
          .map(
            (q) => `(
          '${q.label}', 
          '${q.description}', 
          '${q.type}', 
          ${q.required}, 
          ${q.order}
        )`,
          )
          .join(',')}
      ) AS q(label, description, type, required, "order"),
      forms qs
      WHERE qs.name = 'leave-request';
    `);

    // Update Select Options
    formfieldsList.forEach(async (formfield) => {
      if (formfield.type === FormFieldType.SELECT) {
        await queryRunner.query(`
          UPDATE formfields q
          SET "selectOptions" = '${formfield.selectOptions.join('\n')}'
          FROM forms qs
          WHERE q.label = '${formfield.label}' 
          AND q."formsId" = qs.id 
          AND qs.name = 'leave-request';
        `);
      }
    });

    const formfields = await queryRunner.query(`
      SELECT q.id, q.label 
      FROM formfields q
      JOIN forms qs ON q."formsId" = qs.id
      WHERE qs.name = 'leave-request' 
      ORDER BY q."order";
    `);

    await queryRunner.query(`
      UPDATE forms
      SET layout = '${JSON.stringify({
        groups: [
          {
            id: 'leave-type',
            title: 'Leave Type',
            columns: 1,
            spacing: 4,
            formfieldIds: formfields.slice(0, 1).map((q) => q.id),
          },
          {
            id: 'leave-dates',
            title: 'Leave Duration',
            columns: 3,
            spacing: 4,
            formfieldIds: formfields.slice(1, 5).map((q) => q.id),
          },
          {
            id: 'additional-info',
            title: 'Additional Information',
            columns: 2,
            spacing: 4,
            formfieldIds: formfields.slice(5, 8).map((q) => q.id),
          },
        ],
      })}'::jsonb
      WHERE name = 'leave-request';
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM forms 
      WHERE name = 'leave-request';
    `);
  }
}
