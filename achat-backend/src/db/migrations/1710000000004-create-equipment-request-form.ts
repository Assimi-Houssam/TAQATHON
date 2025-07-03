import { MigrationInterface, QueryRunner } from 'typeorm';
import { FormFieldType } from '../../forms/enums/forms.enum';

export class CreateEquipmentRequestForm1710000000004
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
        'equipment-request',
        'Equipment Request Form',
        NOW(),
        NOW()
      )
      RETURNING id;
    `);

    const formfieldsList = [
      {
        label: 'Equipment Category',
        description: 'Type of equipment needed',
        type: FormFieldType.SELECT,
        selectOptions: [
          'Computer Hardware',
          'Office Equipment',
          'Safety Equipment',
          'Tools',
          'Other',
        ],
        required: true,
        order: 1,
      },
      {
        label: 'Equipment Name',
        description: 'Specific name or model of equipment',
        type: FormFieldType.TEXT,
        required: true,
        order: 2,
      },
      {
        label: 'Quantity',
        description: 'Number of items needed',
        type: FormFieldType.NUMBER,
        required: true,
        order: 3,
      },
      {
        label: 'Usage Purpose',
        description: 'How will this equipment be used?',
        type: FormFieldType.TEXTAREA,
        required: true,
        order: 4,
      },
      {
        label: 'Required Date',
        description: 'When do you need this equipment?',
        type: FormFieldType.DATE,
        required: true,
        order: 5,
      },
      {
        label: 'Duration of Use',
        description: 'How long will you need this equipment?',
        type: FormFieldType.SELECT,
        selectOptions: [
          'One-time Use',
          '1-3 Months',
          '3-6 Months',
          '6-12 Months',
          'Permanent',
        ],
        required: true,
        order: 6,
      },
      {
        label: 'Installation Required',
        description: 'Do you need help with installation?',
        type: FormFieldType.SELECT,
        selectOptions: ['Yes', 'No'],
        required: true,
        order: 7,
      },
      {
        label: 'Training Required',
        description: 'Do you need training to use this equipment?',
        type: FormFieldType.SELECT,
        selectOptions: ['Yes', 'No'],
        required: true,
        order: 8,
      },
      {
        label: 'Specifications',
        description: 'Any specific requirements or specifications',
        type: FormFieldType.TEXTAREA,
        required: false,
        order: 9,
      },
      {
        label: 'Cost Estimate',
        description: 'Estimated cost (if known)',
        type: FormFieldType.NUMBER,
        required: false,
        order: 10,
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
      WHERE qs.name = 'equipment-request';
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
          AND qs.name = 'equipment-request';
        `);
      }
    });

    const formfields = await queryRunner.query(`
      SELECT q.id, q.label 
      FROM formfields q
      JOIN forms qs ON q."formsId" = qs.id
      WHERE qs.name = 'equipment-request' 
      ORDER BY q."order";
    `);

    await queryRunner.query(`
      UPDATE forms
      SET layout = '${JSON.stringify({
        groups: [
          {
            id: 'equipment-basics',
            title: 'Basic Information',
            columns: 2,
            spacing: 4,
            formfieldIds: formfields.slice(0, 3).map((q) => q.id),
          },
          {
            id: 'usage-details',
            title: 'Usage Details',
            columns: 2,
            spacing: 4,
            formfieldIds: formfields.slice(3, 6).map((q) => q.id),
          },
          {
            id: 'requirements',
            title: 'Additional Requirements',
            columns: 2,
            spacing: 4,
            formfieldIds: formfields.slice(6, 8).map((q) => q.id),
          },
          {
            id: 'specifications',
            title: 'Specifications and Cost',
            columns: 2,
            spacing: 4,
            formfieldIds: formfields.slice(8, 10).map((q) => q.id),
          },
        ],
      })}'::jsonb
      WHERE name = 'equipment-request';
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM forms 
      WHERE name = 'equipment-request';
    `);
  }
}
