import { MigrationInterface, QueryRunner } from 'typeorm';
import { FormFieldType } from '../../forms/enums/forms.enum';

export class CreateTrainingRequestForm1710000000007
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
        'training-request',
        'Training Request Form',
        NOW(),
        NOW()
      )
      RETURNING id;
    `);

    const formfieldsList = [
      {
        label: 'Training Type',
        description: 'What type of training are you requesting?',
        type: FormFieldType.SELECT,
        selectOptions: [
          'Technical Skills',
          'Soft Skills',
          'Compliance',
          'Safety',
          'Leadership',
        ],
        required: true,
        order: 1,
      },
      {
        label: 'Preferred Training Method',
        description: 'How would you like to receive the training?',
        type: FormFieldType.SELECT,
        selectOptions: ['Online', 'In-Person', 'Hybrid'],
        required: true,
        order: 2,
      },
      {
        label: 'Preferred Start Date',
        description: 'When would you like to start?',
        type: FormFieldType.DATE,
        required: true,
        order: 3,
      },
      {
        label: 'Business Justification',
        description: 'Why do you need this training?',
        type: FormFieldType.TEXTAREA,
        required: true,
        order: 4,
      },
      {
        label: 'Manager Approval',
        description: 'Has your manager approved this request?',
        type: FormFieldType.SELECT,
        selectOptions: ['Yes', 'No', 'Pending'],
        required: true,
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
      WHERE qs.name = 'training-request';
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
          AND qs.name = 'training-request';
        `);
      }
    });

    const formfields = await queryRunner.query(`
      SELECT q.id, q.label 
      FROM formfields q
      JOIN forms qs ON q."formsId" = qs.id
      WHERE qs.name = 'training-request' 
      ORDER BY q."order";
    `);

    await queryRunner.query(`
      UPDATE forms
      SET layout = '${JSON.stringify({
        groups: [
          {
            id: 'training-basics',
            title: 'Training Information',
            columns: 2,
            spacing: 4,
            formfieldIds: formfields.slice(0, 3).map((q) => q.id),
          },
          {
            id: 'approval-info',
            title: 'Approval Information',
            columns: 1,
            spacing: 4,
            formfieldIds: formfields.slice(3, 5).map((q) => q.id),
          },
        ],
      })}'::jsonb
      WHERE name = 'training-request';
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM forms WHERE name = 'training-request';`,
    );
  }
}
