import { MigrationInterface, QueryRunner } from 'typeorm';
import { FormFieldType } from '../../forms/enums/forms.enum';

export class CreateRegisterCompanyForm1710000000001
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create the form
    await queryRunner.query(`
      INSERT INTO forms (
        name,
        description,
        "createdAt",
        "updatedAt"
      )
      VALUES (
        'register-company',
        'Company Registration Form',
        NOW(),
        NOW()
      )
      RETURNING id;
    `);

    const formfieldsList = [
      {
        label: 'Moroccan company',
        description: 'Are you a Moroccan company?',
        type: FormFieldType.BOOLEAN,
        required: true,
        order: 1,
        localizations: {
          fr: {
            label: 'Entreprise marocaine',
            description: 'Êtes-vous une entreprise marocaine ?',
          },
        },
      },
      {
        label: 'Establishment date',
        description: 'Please inform your company establishment date',
        type: FormFieldType.DATE,
        required: true,
        order: 2,
        localizations: {
          fr: {
            label: 'Date de création',
            description:
              'Veuillez indiquer la date de création de votre entreprise',
          },
        },
      },
      {
        label: 'Type of company',
        description:
          'Are you a company whose turnover is less than 3 Million MAD and is located in a province of a OCP site?',
        type: FormFieldType.BOOLEAN,
        required: true,
        order: 3,
        localizations: {
          fr: {
            label: "Type d'entreprise",
            description: 'Êtes-vous une entreprise marocaine ?',
          },
        },
      },
      {
        label: 'Total workforce',
        description:
          'Please indicate the total number of employees for the last completed year',
        type: FormFieldType.NUMBER,
        required: true,
        order: 4,
        localizations: {
          fr: {
            label: 'Effectif total',
            description:
              "Veuillez indiquer le total du nombre d'employés pour l'année complète",
          },
        },
      },
      {
        label: 'Shareholders',
        description: 'Please indicate the main shareholders of your company',
        type: FormFieldType.TEXTAREA,
        required: true,
        maxLength: 2000,
        order: 5,
        localizations: {
          fr: {
            label: 'Actionnaires',
            description:
              'Veuillez indiquer les principaux actionnaires de votre entreprise',
          },
        },
      },
      {
        label: 'Affiliation',
        description: 'Is your company a part of a group?',
        type: FormFieldType.BOOLEAN,
        required: true,
        order: 6,
        localizations: {
          fr: {
            label: 'Affiliation',
            description: "Êtes-vous une partie d'un groupe ?",
          },
        },
      },
      {
        label: 'Subsidiaries',
        description: 'Do you have subsidiaries?',
        type: FormFieldType.BOOLEAN,
        required: true,
        order: 7,
        localizations: {
          fr: {
            label: 'Filiales',
            description: 'Vous avez des filiales ?',
          },
        },
      },
    ];

    // Create formfields with form relation
    for (const field of formfieldsList) {
      // First insert the formfield
      const result = await queryRunner.query(
        `
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
          $1,
          $2,
          $3::formfields_type_enum,
          $4,
          $5,
          f.id,
          NOW(),
          NOW()
        FROM forms f
        WHERE f.name = 'register-company'
        RETURNING id;
      `,
        [
          field.label,
          field.description,
          field.type,
          field.required,
          field.order,
        ],
      );

      const formFieldId = result[0].id;

      // Then insert its localizations
      if (field.localizations) {
        for (const [locale, translation] of Object.entries(
          field.localizations,
        )) {
          await queryRunner.query(
            `
            INSERT INTO form_field_localization (
              locale,
              label,
              description,
              "formFieldId",
              "createdAt",
              "updatedAt"
            )
            VALUES ($1, $2, $3, $4, NOW(), NOW());
          `,
            [locale, translation.label, translation.description, formFieldId],
          );
        }
      }
    }

    // Get formfield IDs for layout
    const formfields = await queryRunner.query(`
      SELECT q.id, q.label
      FROM formfields q
      JOIN forms qs ON q."formsId" = qs.id
      WHERE qs.name = 'register-company'
      ORDER BY q."order";
    `);

    // Update form layout
    await queryRunner.query(`
      UPDATE forms
      SET layout = '${JSON.stringify({
        groups: [
          {
            id: 'company-basic-info',
            title: 'Basic Company Information',
            columns: 2,
            spacing: 4,
            formfieldIds: formfields.slice(0, 5).map((q) => q.id),
          },
          {
            id: 'company-structure',
            title: 'Company Structure',
            columns: 2,
            spacing: 4,
            formfieldIds: formfields.slice(5, 8).map((q) => q.id),
          },
          {
            id: 'legal-documents',
            title: 'Legal Documents',
            columns: 2,
            spacing: 4,
            formfieldIds: formfields.slice(8, 12).map((q) => q.id),
          },
          {
            id: 'business-info',
            title: 'Business Information',
            columns: 2,
            spacing: 4,
            formfieldIds: formfields.slice(12, 15).map((q) => q.id),
          },
        ],
      })}'::jsonb
      WHERE name = 'register-company';
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // The cascade delete will handle the localizations
    await queryRunner.query(`
      DELETE FROM forms
      WHERE name = 'register-company';
    `);
  }
}
