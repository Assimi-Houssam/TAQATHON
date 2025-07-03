import { MigrationInterface, QueryRunner } from 'typeorm';
import { FormFieldType } from '../../forms/enums/forms.enum';

export class CreateCateringRequestForm1710000000011
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
        'catering-request',
        'Catering Request Form',
        NOW(),
        NOW()
      )
      RETURNING id;
    `);

    const formfieldsList = [
      {
        label: 'Event Type',
        description: 'Type of event',
        type: FormFieldType.SELECT,
        selectOptions: ['Meeting', 'Training', 'Conference', 'Social Event'],
        required: true,
        order: 1,
      },
      {
        label: 'Number of People',
        description: 'Number of attendees',
        type: FormFieldType.NUMBER,
        required: true,
        order: 2,
      },
      {
        label: 'Date',
        description: 'Event date',
        type: FormFieldType.DATE,
        required: true,
        order: 3,
      },
      {
        label: 'Service Time',
        description: 'When should the food be served?',
        type: FormFieldType.TEXT,
        required: true,
        order: 4,
      },
      {
        label: 'Menu Preferences',
        description: 'Any specific menu preferences',
        type: FormFieldType.SELECT,
        selectOptions: ['Vegetarian', 'Vegan', 'Halal', 'Regular'],
        required: true,
        order: 5,
      },
      {
        label: 'Dietary Restrictions',
        description: 'List any dietary restrictions',
        type: FormFieldType.TEXTAREA,
        required: false,
        order: 6,
      },
    ];

    // Insert formfields and layout similar to previous migrations...
    // [Previous migration pattern for inserts and layout continues here]
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM forms WHERE name = 'catering-request';`,
    );
  }
}
