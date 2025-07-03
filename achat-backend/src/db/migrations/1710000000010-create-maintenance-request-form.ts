import { MigrationInterface, QueryRunner } from 'typeorm';
import { FormFieldType } from '../../forms/enums/forms.enum';

export class CreateMaintenanceRequestForm1710000000010
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO forms (
        name,
        description,
        "createdAt",
        "updatedAt"
      )
      VALUES (
        'maintenance-request',
        'Maintenance Request Form',
        NOW(),
        NOW()
      )
      RETURNING id;
    `);

    const formfieldsList = [
      {
        label: 'Issue Type',
        description: 'Type of maintenance issue',
        type: FormFieldType.SELECT,
        selectOptions: [
          'Plumbing',
          'Electrical',
          'HVAC',
          'Structural',
          'Other',
        ],
        required: true,
        order: 1,
      },
      {
        label: 'Location',
        description: 'Where is the issue located?',
        type: FormFieldType.TEXT,
        required: true,
        order: 2,
      },
      {
        label: 'Issue Description',
        description: 'Describe the maintenance issue',
        type: FormFieldType.TEXTAREA,
        required: true,
        order: 3,
      },
      {
        label: 'Priority',
        description: 'How urgent is this issue?',
        type: FormFieldType.SELECT,
        selectOptions: ['Low', 'Medium', 'High', 'Emergency'],
        required: true,
        order: 4,
      },
      {
        label: 'Photos',
        description: 'Upload photos of the issue',
        type: FormFieldType.FILE,
        required: false,
        order: 5,
      },
    ];

    // Insert formfields
    await queryRunner.query(`
      INSERT INTO formfields (
        label, description, type, required, "order", "formsId", "createdAt", "updatedAt"
      ) 
      SELECT 
        q.label, q.description, q.type::formfields_type_enum, q.required, q.order, qs.id, NOW(), NOW()
      FROM (
      VALUES ${formfieldsList
        .map(
          (q) => `(
      '${q.label}', '${q.description}', '${q.type}', ${q.required}, ${q.order}
      )`,
        )
        .join(',')}
      ) AS q(label, description, type, required, "order"),
      forms qs
      WHERE qs.name = 'maintenance-request';
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
          AND qs.name = 'maintenance-request';
        `);
      }
    });
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM forms WHERE name = 'maintenance-request';`,
    );
  }
}
