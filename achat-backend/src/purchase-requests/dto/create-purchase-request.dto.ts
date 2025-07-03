import { z } from 'zod';
import { createZodDto } from '../../../utils/zod-dto';
import { ItemType, RequestType } from '../enums/purchase-request.enum';

export const createPurchaseRequestSchema = z.object({
  requestTitle: z.string().min(1, 'Title is required'),
  department: z.number().min(1, 'Department is required'),
  deliveryDate: z.coerce.date(),
  deliveryAddress: z.string().min(1, 'Delivery address is required'),
  priority: z.enum(['Low', 'Medium', 'High', 'Critical']),
  itemType: z.nativeEnum(ItemType),
  settings: z.object({
    dueDate: z.coerce.date(),
    publishmentDate: z.coerce.date().optional(),
    requestType: z.nativeEnum(RequestType),
  }),
  erpReference: z.string().min(1, 'ERP Reference is required'),
  items: z
    .array(
      z.object({
        description: z.string().min(1, 'Description is required'),
        quantity: z.number().min(1, 'Quantity must be at least 1'),
        estimatedPrice: z.coerce.number().min(0, 'Price cannot be negative'),
        currency: z.string().min(1, 'Currency is required'),
        unit: z.string().min(1, 'Unit is required'),
      }),
    )
    .superRefine((items, ctx) => {
      const itemType = (ctx.path[0] as unknown as { itemType: ItemType })
        ?.itemType;
      if (itemType === ItemType.MATERIALS && (!items || items.length === 0)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'At least one item is required for material requests',
        });
        return false;
      }
      return true;
    }),
  notes: z.string().optional(),
  attachments: z.array(z.string()).optional(),
  operators: z.array(z.number()).optional(),
  companies: z.array(z.number()).optional(),
});

export class CreatePurchaseRequestDto extends createZodDto(
  createPurchaseRequestSchema,
) {}
