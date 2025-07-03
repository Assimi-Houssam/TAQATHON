import {
  ArgumentMetadata,
  BadRequestException,
  PipeTransform,
} from '@nestjs/common';
import { ZodSchema, ZodTypeDef } from 'zod';
import { ZodDto, isZodDto } from './zod-dto';

export function validate<
  TOutput = any,
  TDef extends ZodTypeDef = ZodTypeDef,
  TInput = TOutput,
>(
  value: unknown,
  schemaOrDto: ZodSchema<TOutput, TDef, TInput> | ZodDto<TOutput, TDef, TInput>,
) {
  const schema = isZodDto(schemaOrDto) ? schemaOrDto.schema : schemaOrDto;

  const result = schema.safeParse(value);
  if (!result.success) {
    console.error(result.error);
    throw new BadRequestException('Validation failed');
  }

  return result.data;
}

export class ZodValidationPipe implements PipeTransform {
  constructor(private schemaOrDto?: ZodSchema | ZodDto) {}

  public transform(value: unknown, metadata: ArgumentMetadata) {
    if (this.schemaOrDto) {
      return validate(value, this.schemaOrDto);
    }

    const { metatype } = metadata;

    if (!isZodDto(metatype)) {
      return value;
    }

    return validate(value, metatype.schema);
  }
}
