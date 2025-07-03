import { MigrationInterface, QueryRunner } from 'typeorm';
import { FormFieldType } from '../../forms/enums/forms.enum';

export class CreatePurchaseRequestForm1710000000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // First create the form
    await queryRunner.query(`
      INSERT INTO forms (
        name,
        description,
        "createdAt",
        "updatedAt"
      )
      VALUES (
        'purchase-request',
        'Purchase Request Form',
        NOW(),
        NOW()
      )
      RETURNING id;
    `);

    const formfieldsList = [
      // Request Details
      {
        label: 'Request Title',
        description: 'Enter a descriptive title for your purchase request',
        type: FormFieldType.TEXT,
        required: true,
        order: 1,
      },
      {
        label: 'Department',
        description: 'Select your department',
        type: FormFieldType.TEXT,
        required: true,
        order: 2,
      },
      {
        label: 'Cost Center',
        description: 'Enter the cost center code',
        type: FormFieldType.TEXT,
        required: true,
        order: 3,
      },
      {
        label: 'Required Delivery Date',
        description: 'When do you need these items?',
        type: FormFieldType.DATE,
        required: true,
        order: 4,
      },
      {
        label: 'Delivery Address',
        description: 'Where should the items be delivered?',
        type: FormFieldType.TEXT,
        required: true,
        order: 5,
      },
      {
        label: 'Priority Level',
        description: 'Select the urgency level of this request',
        type: FormFieldType.SELECT,
        selectOptions: ['Low', 'Medium', 'High', 'Critical'],
        required: true,
        order: 6,
      },
      {
        label: 'Budget Code',
        description: 'Enter the budget code for this purchase',
        type: FormFieldType.TEXT,
        required: true,
        order: 7,
      },
      // Requester Information
      {
        label: 'Requester Name',
        description: 'Your full name',
        type: FormFieldType.TEXT,
        required: true,
        order: 8,
      },
      {
        label: 'Employee ID',
        description: 'Your employee identification number',
        type: FormFieldType.TEXT,
        required: true,
        order: 9,
      },
      {
        label: 'Contact Number',
        description: 'Your contact phone number',
        type: FormFieldType.PHONE,
        required: true,
        order: 10,
      },
      // ERP Details
      {
        label: 'GL Account',
        description: 'General Ledger Account number',
        type: FormFieldType.TEXT,
        required: true,
        order: 11,
      },
      {
        label: 'Cost Object',
        description: 'Cost object identifier',
        type: FormFieldType.TEXT,
        required: true,
        order: 12,
      },
      {
        label: 'Internal Order',
        description: 'Internal order number (if applicable)',
        type: FormFieldType.TEXT,
        required: false,
        order: 13,
      },
      {
        label: 'WBS Element',
        description: 'Work Breakdown Structure element (if applicable)',
        type: FormFieldType.TEXT,
        required: false,
        order: 14,
      },
      // Item Details
      {
        label: 'Item Description',
        description: 'Detailed description of the item needed',
        type: FormFieldType.TEXT,
        required: true,
        order: 15,
      },
      {
        label: 'Quantity',
        description: 'Number of items needed',
        type: FormFieldType.NUMBER,
        required: true,
        order: 16,
      },
      {
        label: 'Estimated Price',
        description: 'Estimated price per unit',
        type: FormFieldType.NUMBER,
        required: true,
        order: 17,
      },
      {
        label: 'Unit',
        description: 'Unit of measurement (e.g., pcs, kg)',
        type: FormFieldType.TEXT,
        required: true,
        order: 18,
      },
      {
        label: 'Technical Specifications',
        description: 'Any technical specifications or requirements',
        type: FormFieldType.TEXTAREA,
        required: false,
        order: 19,
      },
      // Additional Information
      {
        label: 'Notes',
        description: 'Any additional notes or comments',
        type: FormFieldType.TEXTAREA,
        required: false,
        order: 20,
      },
      {
        label: 'Supporting Documents',
        description: 'Upload any supporting documents',
        type: FormFieldType.FILE,
        required: false,
        order: 21,
      },
    ];

    // Create formfields with form relation
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
      WHERE qs.name = 'purchase-request';
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
          AND qs.name = 'purchase-request';
        `);
      }
    });

    // Get the inserted formfield IDs
    const formfields = await queryRunner.query(`
      SELECT q.id, q.label 
      FROM formfields q
      JOIN forms qs ON q."formsId" = qs.id
      WHERE qs.name = 'purchase-request' 
      ORDER BY q."order";
    `);

    // Update form with layout
    await queryRunner.query(`
      UPDATE forms
      SET layout = '${JSON.stringify({
        groups: [
          {
            id: 'request-details',
            title: 'Request Details',
            columns: 2,
            spacing: 4,
            formfieldIds: formfields.slice(0, 7).map((q) => q.id),
          },
          {
            id: 'requester-info',
            title: 'Requester Information',
            columns: 3,
            spacing: 4,
            formfieldIds: formfields.slice(7, 10).map((q) => q.id),
          },
          {
            id: 'erp-details',
            title: 'ERP Details',
            columns: 2,
            spacing: 4,
            formfieldIds: formfields.slice(10, 14).map((q) => q.id),
          },
          {
            id: 'item-details',
            title: 'Item Details',
            columns: 2,
            spacing: 4,
            formfieldIds: formfields.slice(14, 19).map((q) => q.id),
          },
          {
            id: 'additional-info',
            title: 'Additional Information',
            columns: 1,
            spacing: 4,
            formfieldIds: formfields.slice(19, 21).map((q) => q.id),
          },
        ],
      })}'::jsonb
      WHERE name = 'purchase-request';
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // This will cascade delete all related formfields
    await queryRunner.query(`
      DELETE FROM forms 
      WHERE name = 'purchase-request';
    `);
  }
}
