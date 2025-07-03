import { MigrationInterface, QueryRunner } from 'typeorm';
import { FormFieldType } from '../../forms/enums/forms.enum';

export class CreateVisitorAccessForm1710000000008 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO forms (
        name,
        description,
        "createdAt",
        "updatedAt"
      )
      VALUES (
        'visitor-access',
        'Visitor Access Request Form',
        NOW(),
        NOW()
      )
      RETURNING id;
    `);

    const formfieldsList = [
      {
        label: 'Visitor Name',
        description: 'Full name of the visitor',
        type: FormFieldType.TEXT,
        required: true,
        order: 1,
      },
      {
        label: 'Visit Date',
        description: 'Date of visit',
        type: FormFieldType.DATE,
        required: true,
        order: 2,
      },
      {
        label: 'Visit Duration',
        description: 'Expected duration of visit',
        type: FormFieldType.SELECT,
        selectOptions: ['Half Day', 'Full Day', 'Multiple Days'],
        required: true,
        order: 3,
      },
      {
        label: 'Purpose',
        description: 'Purpose of visit',
        type: FormFieldType.TEXT,
        required: true,
        order: 4,
      },
      {
        label: 'Areas to Access',
        description: 'Which areas need to be accessed?',
        type: FormFieldType.SELECT,
        selectOptions: ['Office Area', 'Meeting Rooms', 'Labs', 'Production Area'],
        required: true,
        order: 5,
      }
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
      WHERE qs.name = 'visitor-access';
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
          AND qs.name = 'visitor-access';
        `);
      }
    });

    // Get formfield IDs for layout
    const formfields = await queryRunner.query(`
      SELECT q.id, q.label 
      FROM formfields q
      JOIN forms qs ON q."formsId" = qs.id
      WHERE qs.name = 'visitor-access' 
      ORDER BY q."order";
    `);

    // Update layout
    await queryRunner.query(`
      UPDATE forms
      SET layout = '${JSON.stringify({
        groups: [
          {
            id: 'visitor-info',
            title: 'Visitor Information',
            columns: 2,
            spacing: 4,
            formfieldIds: formfields.slice(0, 2).map((q) => q.id),
          },
          {
            id: 'visit-details',
            title: 'Visit Details',
            columns: 2,
            spacing: 4,
            formfieldIds: formfields.slice(2, 5).map((q) => q.id),
          }
        ],
      })}'::jsonb
      WHERE name = 'visitor-access';
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM forms WHERE name = 'visitor-access';`);
  }
} 