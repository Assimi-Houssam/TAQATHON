import { MigrationInterface, QueryRunner } from 'typeorm';
import { FormFieldType } from '../../forms/enums/forms.enum';

export class CreateTravelRequestForm1710000000002
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
        'travel-request',
        'Travel Request Form',
        NOW(),
        NOW()
      )
      RETURNING id;
    `);

    const formfieldsList = [
      {
        label: 'Travel Purpose',
        description: 'Purpose of your travel',
        type: FormFieldType.SELECT,
        selectOptions: [
          'Business Meeting',
          'Conference',
          'Training',
          'Client Visit',
          'Other',
        ],
        required: true,
        order: 1,
      },
      {
        label: 'Destination',
        description: 'Where are you traveling to?',
        type: FormFieldType.TEXT,
        required: true,
        order: 2,
      },
      {
        label: 'Departure Date',
        description: 'When do you plan to depart?',
        type: FormFieldType.DATE,
        required: true,
        order: 3,
      },
      {
        label: 'Return Date',
        description: 'When do you plan to return?',
        type: FormFieldType.DATE,
        required: true,
        order: 4,
      },
      {
        label: 'Transportation Type',
        description: 'Preferred mode of transportation',
        type: FormFieldType.SELECT,
        selectOptions: ['Air', 'Train', 'Car', 'Bus'],
        required: true,
        order: 5,
      },
      {
        label: 'Accommodation Required',
        description: 'Do you need accommodation?',
        type: FormFieldType.SELECT,
        selectOptions: ['Yes', 'No'],
        required: true,
        order: 6,
      },
      {
        label: 'Estimated Cost',
        description: 'Estimated total cost of travel',
        type: FormFieldType.NUMBER,
        required: true,
        order: 7,
      },
      {
        label: 'Additional Notes',
        description: 'Any additional information',
        type: FormFieldType.TEXTAREA,
        required: false,
        order: 8,
      },
    ];

    // Insert formfields with the same pattern as before
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
      WHERE qs.name = 'travel-request';
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
          AND qs.name = 'travel-request';
        `);
      }
    });

    // Get formfield IDs for layout
    const formfields = await queryRunner.query(`
      SELECT q.id, q.label 
      FROM formfields q
      JOIN forms qs ON q."formsId" = qs.id
      WHERE qs.name = 'travel-request' 
      ORDER BY q."order";
    `);

    // Update layout
    await queryRunner.query(`
      UPDATE forms
      SET layout = '${JSON.stringify({
        groups: [
          {
            id: 'travel-basics',
            title: 'Travel Information',
            columns: 2,
            spacing: 4,
            formfieldIds: formfields.slice(0, 2).map((q) => q.id),
          },
          {
            id: 'dates',
            title: 'Travel Dates',
            columns: 2,
            spacing: 4,
            formfieldIds: formfields.slice(2, 4).map((q) => q.id),
          },
          {
            id: 'logistics',
            title: 'Travel Logistics',
            columns: 2,
            spacing: 4,
            formfieldIds: formfields.slice(4, 7).map((q) => q.id),
          },
          {
            id: 'additional',
            title: 'Additional Information',
            columns: 1,
            spacing: 4,
            formfieldIds: formfields.slice(7, 8).map((q) => q.id),
          },
        ],
      })}'::jsonb
      WHERE name = 'travel-request';
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM forms 
      WHERE name = 'travel-request';
    `);
  }
}
