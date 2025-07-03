import { MigrationInterface, QueryRunner } from 'typeorm';
import { FormFieldType } from '../../forms/enums/forms.enum';

export class CreateRoomBookingForm1710000000005 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO forms (
        name,
        description,
        "createdAt",
        "updatedAt"
      )
      VALUES (
        'room-booking',
        'Room Booking Request Form',
        NOW(),
        NOW()
      )
      RETURNING id;
    `);

    const formfieldsList = [
      {
        label: 'Room Type',
        description: 'What type of room do you need?',
        type: FormFieldType.SELECT,
        selectOptions: [
          'Meeting Room',
          'Conference Room',
          'Training Room',
          'Interview Room',
        ],
        required: true,
        order: 1,
      },
      {
        label: 'Date',
        description: 'When do you need the room?',
        type: FormFieldType.DATE,
        required: true,
        order: 2,
      },
      {
        label: 'Start Time',
        description: 'Start time of booking',
        type: FormFieldType.TEXT,
        required: true,
        order: 3,
      },
      {
        label: 'End Time',
        description: 'End time of booking',
        type: FormFieldType.TEXT,
        required: true,
        order: 4,
      },
      {
        label: 'Number of Attendees',
        description: 'How many people will attend?',
        type: FormFieldType.NUMBER,
        required: true,
        order: 5,
      },
      {
        label: 'Purpose',
        description: 'Purpose of the booking',
        type: FormFieldType.TEXT,
        required: true,
        order: 6,
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
      WHERE qs.name = 'room-booking';
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
          AND qs.name = 'room-booking';
        `);
      }
    });

    const formfields = await queryRunner.query(`
      SELECT q.id, q.label 
      FROM formfields q
      JOIN forms qs ON q."formsId" = qs.id
      WHERE qs.name = 'room-booking' 
      ORDER BY q."order";
    `);

    await queryRunner.query(`
      UPDATE forms
      SET layout = '${JSON.stringify({
        groups: [
          {
            id: 'room-details',
            title: 'Room Details',
            columns: 2,
            spacing: 4,
            formfieldIds: formfields.slice(0, 2).map((q) => q.id),
          },
          {
            id: 'booking-time',
            title: 'Booking Time',
            columns: 2,
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
      WHERE name = 'room-booking';
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM forms 
      WHERE name = 'room-booking';
    `);
  }
}
