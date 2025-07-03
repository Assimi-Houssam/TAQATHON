import { MigrationInterface, QueryRunner } from 'typeorm';
import { FormFieldType } from '../../forms/enums/forms.enum';

export class CreateITServiceRequestForm1710000000001
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
        'it-service-request',
        'IT Service Request Form',
        NOW(),
        NOW()
      )
      RETURNING id;
    `);

    const formfieldsList = [
      {
        label: 'Service Type',
        description: 'What type of IT service do you need?',
        type: FormFieldType.SELECT,
        selectOptions: [
          'Hardware Support',
          'Software Support',
          'Network Issues',
          'Account Access',
          'Other',
        ],
        required: true,
        order: 1,
      },
      {
        label: 'Issue Priority',
        description: 'How urgent is this issue?',
        type: FormFieldType.SELECT,
        selectOptions: ['Low', 'Medium', 'High', 'Critical'],
        required: true,
        order: 2,
      },
      {
        label: 'Issue Description',
        description: 'Please describe your issue in detail',
        type: FormFieldType.TEXTAREA,
        required: true,
        order: 3,
      },
      {
        label: 'Affected Systems',
        description: 'Which systems are affected?',
        type: FormFieldType.TEXT,
        required: true,
        order: 4,
      },
      {
        label: 'Location',
        description: 'Your current location/office',
        type: FormFieldType.TEXT,
        required: true,
        order: 5,
      },
      {
        label: 'Screenshots',
        description: 'Upload relevant screenshots if applicable',
        type: FormFieldType.FILE,
        required: false,
        order: 6,
      },
    ];

    // Insert formfields
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
      WHERE qs.name = 'it-service-request';
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
          AND qs.name = 'it-service-request';
        `);
      }
    });

    // Get formfield IDs for layout
    const formfields = await queryRunner.query(`
      SELECT q.id, q.label 
      FROM formfields q
      JOIN forms qs ON q."formsId" = qs.id
      WHERE qs.name = 'it-service-request' 
      ORDER BY q."order";
    `);

    // Update layout
    await queryRunner.query(`
      UPDATE forms
      SET layout = '${JSON.stringify({
        groups: [
          {
            id: 'service-details',
            title: 'Service Request Details',
            columns: 2,
            spacing: 4,
            formfieldIds: formfields.slice(0, 2).map((q) => q.id),
          },
          {
            id: 'issue-details',
            title: 'Issue Information',
            columns: 1,
            spacing: 4,
            formfieldIds: formfields.slice(2, 4).map((q) => q.id),
          },
          {
            id: 'additional-info',
            title: 'Additional Information',
            columns: 2,
            spacing: 4,
            formfieldIds: formfields.slice(4, 6).map((q) => q.id),
          },
        ],
      })}'::jsonb
      WHERE name = 'it-service-request';
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM forms 
      WHERE name = 'it-service-request';
    `);
  }
}
