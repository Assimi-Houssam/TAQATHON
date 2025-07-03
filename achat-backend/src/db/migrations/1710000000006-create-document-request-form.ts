import { MigrationInterface, QueryRunner } from 'typeorm';
import { FormFieldType } from '../../forms/enums/forms.enum';

export class CreateDocumentRequestForm1710000000006
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
        'document-request',
        'Document Request Form',
        NOW(),
        NOW()
      )
      RETURNING id;
    `);

    const formfieldsList = [
      {
        label: 'Document Type',
        description: 'Type of document needed',
        type: FormFieldType.SELECT,
        selectOptions: [
          'Employment Certificate',
          'Salary Statement',
          'Tax Documents',
          'Work Reference',
          'Other',
        ],
        required: true,
        order: 1,
      },
      {
        label: 'Purpose',
        description: 'Purpose for requesting the document',
        type: FormFieldType.TEXT,
        required: true,
        order: 2,
      },
      {
        label: 'Required Date',
        description: 'When do you need this document?',
        type: FormFieldType.DATE,
        required: true,
        order: 3,
      },
      {
        label: 'Delivery Method',
        description: 'How would you like to receive the document?',
        type: FormFieldType.SELECT,
        selectOptions: ['Email', 'Physical Copy', 'Both'],
        required: true,
        order: 4,
      },
      {
        label: 'Additional Notes',
        description: 'Any specific requirements or notes',
        type: FormFieldType.TEXTAREA,
        required: false,
        order: 5,
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
      WHERE qs.name = 'document-request';
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
          AND qs.name = 'document-request';
        `);
      }
    });

    const formfields = await queryRunner.query(`
      SELECT q.id, q.label 
      FROM formfields q
      JOIN forms qs ON q."formsId" = qs.id
      WHERE qs.name = 'document-request' 
      ORDER BY q."order";
    `);

    await queryRunner.query(`
      UPDATE forms
      SET layout = '${JSON.stringify({
        groups: [
          {
            id: 'document-details',
            title: 'Document Details',
            columns: 2,
            spacing: 4,
            formfieldIds: formfields.slice(0, 2).map((q) => q.id),
          },
          {
            id: 'delivery-details',
            title: 'Delivery Details',
            columns: 2,
            spacing: 4,
            formfieldIds: formfields.slice(2, 4).map((q) => q.id),
          },
          {
            id: 'additional-info',
            title: 'Additional Information',
            columns: 1,
            spacing: 4,
            formfieldIds: formfields.slice(4, 5).map((q) => q.id),
          },
        ],
      })}'::jsonb
      WHERE name = 'document-request';
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM forms 
      WHERE name = 'document-request';
    `);
  }
}
