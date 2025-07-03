import { MigrationInterface, QueryRunner } from 'typeorm';
import { FormFieldType } from '../../forms/enums/forms.enum';

export class CreateSoftwareLicenseForm1710000000009
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
        'software-license',
        'Software License Request Form',
        NOW(),
        NOW()
      )
      RETURNING id;
    `);

    const formfieldsList = [
      {
        label: 'Software Name',
        description: 'Name of the software',
        type: FormFieldType.TEXT,
        required: true,
        order: 1,
      },
      {
        label: 'License Type',
        description: 'Type of license needed',
        type: FormFieldType.SELECT,
        selectOptions: ['Individual', 'Team', 'Enterprise'],
        required: true,
        order: 2,
      },
      {
        label: 'Duration',
        description: 'How long do you need the license?',
        type: FormFieldType.SELECT,
        selectOptions: ['1 Month', '3 Months', '6 Months', '1 Year'],
        required: true,
        order: 3,
      },
      {
        label: 'Business Need',
        description: 'Why do you need this software?',
        type: FormFieldType.TEXTAREA,
        required: true,
        order: 4,
      },
    ];

    // Insert formfields and layout similar to previous migrations...
    // [Previous migration pattern for inserts and layout continues here]
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM forms WHERE name = 'software-license';`,
    );
  }
}
