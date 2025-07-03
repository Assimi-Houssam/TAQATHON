import { PipeTransform, Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { z } from 'zod';

@Injectable()
export class WsZodValidationPipe implements PipeTransform {
  constructor(private schema: z.ZodType) {}

  async transform(value: unknown) {
    try {
      const parsedData = this.schema.parse(value);

      return parsedData;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formattedErrors = error.errors
          .map((err) => `${err.path.join('.')}: ${err.message}`)
          .join(', ');
        throw new WsException(`Validation failed: ${formattedErrors}`);
      } else {
        throw new WsException('Validation failed');
      }
    }
  }
}
