import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, In, Repository } from 'typeorm';
import { CreateAnswerDto } from './dto/answer.dto';
import { CreateFormFieldDto } from './dto/formfield.dto';
import { CreateFormDto } from './dto/forms.dto';
import { LayoutDto } from './dto/layout.dto';
import { Answer } from './entities/answer.entity';
import { Form } from './entities/form.entity';
import { FormFieldLocalization } from './entities/formfield-localization.entity';
import { FormField } from './entities/formfield.entity';
import { FormFieldType } from './enums/forms.enum';

@Injectable()
export class FormsService {
  constructor(
    @InjectRepository(FormField)
    private readonly formFieldRepository: Repository<FormField>,
    @InjectRepository(FormFieldLocalization)
    private readonly formFieldLocalizationRepository: Repository<FormFieldLocalization>,
    @InjectRepository(Answer)
    private readonly answerRepository: Repository<Answer>,
    @InjectRepository(Form)
    private readonly formRepository: Repository<Form>,
  ) {}

  async getAllForms(): Promise<Form[]> {
    return await this.formRepository.find({
      order: {
        id: 'ASC',
      },
    });
  }

  async createForm(data: CreateFormDto): Promise<Form> {
    const form = this.formRepository.create(data as DeepPartial<Form>);
    return await this.formRepository.save(form);
  }

  async createFormField(data: CreateFormFieldDto): Promise<FormField> {
    try {
      await this.validateFormFieldTypeConstraints(data);

      const form = await this.formRepository.findOne({
        where: { name: data.formName },
      });

      if (!form) {
        throw new NotFoundException(`Form ${data.formName} not found`);
      }

      // Handle nested fields for array type
      let arrayFields;
      if (data.type === FormFieldType.ARRAY && data.arrayFields) {
        arrayFields = data.arrayFields.map((field) =>
          this.formFieldRepository.create({
            ...field,
            form,
          } as DeepPartial<FormField>),
        );
      }

      const formField = this.formFieldRepository.create({
        ...data,
        label: data.label,
        required: data.required ?? false,
        form,
        selectOptions: data.selectOptions?.trim() ?? null,
        minDate: data.minDate ? new Date(data.minDate) : null,
        maxDate: data.maxDate ? new Date(data.maxDate) : null,
        allowedFileTypes: data.allowedFileTypes?.trim() ?? null,
        arrayFields,
      } as DeepPartial<FormField>);

      const savedFormField = await this.formFieldRepository.save(formField);

      // Add the form field to the form layout first group
      form.layout?.groups[0].formfieldIds.push(savedFormField.id);
      // Update the form layout
      await this.formRepository.update(form.id, {
        layout: {
          ...form.layout,
        },
      });

      return savedFormField;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to create form field');
    }
  }

  async deleteFormField(id: number): Promise<void> {
    // Delete the form field
    await this.formFieldRepository.delete(id);
    // Remove the form field from the form layout
    const form = await this.formRepository.findOne({
      where: { formfields: { id } },
    });
    if (form && form.layout) {
      form.layout.groups.forEach((group) => {
        group.formfieldIds = group.formfieldIds.filter((qId) => qId !== id);
      });
      await this.formRepository.save(form);
    }
  }

  private async validateFormFieldTypeConstraints(
    data: CreateFormFieldDto,
  ): Promise<void> {
    switch (data.type) {
      case FormFieldType.TEXT:
        if (data.minValue || data.maxValue || data.step) {
          throw new BadRequestException(
            'Text form fields cannot have numeric constraints',
          );
        }
        break;

      case FormFieldType.NUMBER:
        if (data.minLength || data.maxLength || data.pattern) {
          throw new BadRequestException(
            'Number form fields cannot have text constraints',
          );
        }
        break;

      case FormFieldType.DATE:
        if (
          data.minLength ||
          data.maxLength ||
          data.minValue ||
          data.maxValue ||
          data.pattern
        ) {
          throw new BadRequestException(
            'Date form fields cannot have text or numeric constraints',
          );
        }
        break;

      case FormFieldType.BOOLEAN:
        if (
          data.minLength ||
          data.maxLength ||
          data.minValue ||
          data.maxValue ||
          data.pattern ||
          data.step ||
          data.minDate ||
          data.maxDate
        ) {
          throw new BadRequestException(
            'Boolean form fields cannot have additional constraints',
          );
        }
        break;

      case FormFieldType.FILE:
        if (
          data.minLength ||
          data.maxLength ||
          data.minValue ||
          data.maxValue ||
          data.pattern ||
          data.step ||
          data.minDate ||
          data.maxDate
        ) {
          throw new BadRequestException(
            'File form fields cannot have text, numeric, or date constraints',
          );
        }
        break;

      case FormFieldType.SELECT:
      case FormFieldType.MULTIPLE_CHOICE:
        if (
          data.minLength ||
          data.maxLength ||
          data.minValue ||
          data.maxValue ||
          data.pattern ||
          data.step ||
          data.minDate ||
          data.maxDate
        ) {
          throw new BadRequestException(
            'Choice form fields cannot have additional constraints',
          );
        }
        if (!data.selectOptions?.length) {
          throw new BadRequestException('Choice form fields must have options');
        }
        break;

      case FormFieldType.ARRAY:
        if (
          data.minLength ||
          data.maxLength ||
          data.minValue ||
          data.maxValue ||
          data.pattern ||
          data.step ||
          data.minDate ||
          data.maxDate ||
          data.selectOptions
        ) {
          throw new BadRequestException(
            'Array form fields cannot have text, numeric, or date constraints',
          );
        }
        if (!data.arrayFields?.length) {
          throw new BadRequestException(
            'Array form fields must have at least one field definition',
          );
        }
        // Recursively validate nested fields
        for (const field of data.arrayFields) {
          await this.validateFormFieldTypeConstraints(field);
        }
        break;
    }
  }

  async validateAnswers(answers: CreateAnswerDto[]): Promise<boolean> {
    const result = await Promise.all(
      answers.map(async (answer) => {
        const formField = await this.formFieldRepository.findOne({
          where: { id: answer.formfieldId },
        });
        if (!formField) {
          return false;
        }
        await this.validateAnswer(answer, formField);
        return true;
      }),
    );
    return result.every((r) => r);
  }

  async createAnswer(data: CreateAnswerDto): Promise<Answer> {
    return await this.answerRepository.manager.transaction(async (manager) => {
      const formField = await manager.findOne(FormField, {
        where: { id: data.formfieldId },
      });

      if (!formField) {
        throw new NotFoundException(
          `Form field #${data.formfieldId} not found`,
        );
      }

      await this.validateAnswer(data, formField);

      const answer = this.answerRepository.create({
        content: data.content,
        formfield: formField,
        file: data.file,
        company: data.companyId ? { id: data.companyId } : null,
      });

      return await manager.save(Answer, answer);
    });
  }

  async getFormFieldWithAnswers(id: number): Promise<FormField> {
    const formField = await this.formFieldRepository
      .createQueryBuilder('formfield')
      .leftJoinAndSelect('formfield.answers', 'answers')
      .leftJoinAndSelect('answers.company', 'company')
      .where('formfield.id = :id', { id })
      .getOne();

    if (!formField) {
      throw new NotFoundException(`Form field #${id} not found`);
    }

    return formField;
  }

  private async validateAnswer(
    data: CreateAnswerDto,
    formField: FormField,
  ): Promise<void> {
    if (formField.required && !data.content && !data.file) {
      throw new BadRequestException('This form field requires an answer');
    }

    if (!formField.required && !data.content && !data.file) {
      return;
    }

    switch (formField.type) {
      case FormFieldType.MULTIPLE_CHOICE:
        const options =
          formField.selectOptions?.split('\n').map((opt) => opt.trim()) ?? [];
        if (!options.includes(data.content)) {
          throw new BadRequestException(
            `Invalid answer option. Must be one of: ${options.join(', ')}`,
          );
        }
        break;
      case FormFieldType.FILE:
        if (formField.required && !data.file) {
          throw new BadRequestException('File upload is required');
        }
        break;
      case FormFieldType.TEXT:
      case FormFieldType.TEXTAREA:
        if (
          formField.required &&
          (!data.content || data.content.trim().length === 0)
        ) {
          throw new BadRequestException('Text answer cannot be empty');
        }
        if (data.content) {
          if (
            formField.minLength &&
            data.content.length < formField.minLength
          ) {
            throw new BadRequestException(
              `Answer must be at least ${formField.minLength} characters long`,
            );
          }
          if (
            formField.maxLength &&
            data.content.length > formField.maxLength
          ) {
            throw new BadRequestException(
              `Answer cannot be longer than ${formField.maxLength} characters`,
            );
          }
        }
        break;
      case FormFieldType.NUMBER:
        const numValue = Number(data.content);
        if (isNaN(numValue)) {
          throw new BadRequestException('Answer must be a valid number');
        }
        if (formField.minValue && numValue < formField.minValue) {
          throw new BadRequestException(
            `Number must be greater than or equal to ${formField.minValue}`,
          );
        }
        if (formField.maxValue && numValue > formField.maxValue) {
          throw new BadRequestException(
            `Number must be less than or equal to ${formField.maxValue}`,
          );
        }
        break;
      case FormFieldType.DATE:
        const dateValue = new Date(data.content);
        if (isNaN(dateValue.getTime())) {
          throw new BadRequestException('Answer must be a valid date');
        }
        if (formField.minDate && dateValue < new Date(formField.minDate)) {
          throw new BadRequestException(
            `Date must be after ${formField.minDate}`,
          );
        }
        if (formField.maxDate && dateValue > new Date(formField.maxDate)) {
          throw new BadRequestException(
            `Date must be before ${formField.maxDate}`,
          );
        }
        break;
      case FormFieldType.BOOLEAN:
        if (data.content !== 'true' && data.content !== 'false') {
          throw new BadRequestException('Answer must be true or false');
        }
        break;
    }
  }

  // Get all form fields for a form
  async getAllFormFields(form: string, locale?: string): Promise<FormField[]> {
    const formId = await this.formRepository.findOne({
      where: { name: form },
    });

    if (!formId) {
      throw new NotFoundException(`Form ${form} not found`);
    }

    const formFields = await this.formFieldRepository.find({
      where: { forms: { id: formId.id } },
    });

    // if locale is provided we query the localizations table
    if (locale) {
      const localizations = await this.formFieldLocalizationRepository.find({
        where: { formField: { id: In(formFields.map((f) => f.id)) }, locale },
        relations: ['formField'],
      });

      // merge the formFields with the localizations
      const mergedFormFields = formFields.map((field) => {
        const localization = localizations.find(
          (l) => l.formField.id === field.id,
        );
        if (localization) {
          // Create a copy without the formField relation and preserve the original field's id
          const { formField, ...localizationWithoutRelation } = localization;
          // overwrite the id of localizationWithoutRelation with the id of formField
          return {
            ...field,
            ...{ ...localizationWithoutRelation, id: formField.id },
          };
        }
        return field;
      });

      return mergedFormFields;
    }
    return formFields;
  }

  async saveLayout(formName: string, layout: LayoutDto['layout']) {
    const form = await this.formRepository.findOne({
      where: { name: formName },
    });

    if (!form) {
      throw new NotFoundException(`Form ${formName} not found`);
    }

    form.layout = layout;
    return await this.formRepository.save(form);
  }

  async getLayout(formName: string) {
    const form = await this.formRepository.findOne({
      where: { name: formName },
      relations: ['formfields'],
    });

    if (!form) {
      throw new NotFoundException(`Form ${formName} not found`);
    }

    if (form.layout) {
      return form.layout;
    }

    // Generate default layout
    return {
      groups: [
        {
          id: 'default',
          title: 'Default Group',
          columns: 2,
          spacing: 4,
          formfieldIds: form.formfields.map((q) => q.id.toString()),
        },
      ],
    };
  }

  async updateFormField(
    id: number,
    data: Partial<CreateFormFieldDto>,
  ): Promise<FormField> {
    const formField = await this.formFieldRepository.findOne({ where: { id } });

    if (!formField) {
      throw new NotFoundException(`Form field #${id} not found`);
    }

    try {
      // If type is being updated, validate new constraints
      if (data.type) {
        await this.validateFormFieldTypeConstraints({
          ...formField,
          ...data,
        } as CreateFormFieldDto);
      }

      // Update the form field
      Object.assign(formField, {
        ...data,
        required: data.required ?? formField.required,
        selectOptions: data.selectOptions?.trim() ?? formField.selectOptions,
        minDate: data.minDate ? new Date(data.minDate) : formField.minDate,
        maxDate: data.maxDate ? new Date(data.maxDate) : formField.maxDate,
      });

      return await this.formFieldRepository.save(formField);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to update form field');
    }
  }
}
