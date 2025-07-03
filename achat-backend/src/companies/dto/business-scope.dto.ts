// create dto for add new business scope and update business scope and assign business scope to company using zod

import { z } from 'zod';

export const AddNewBusinessScopeDto = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
});

export const AssignBusinessScopeToCompanyDto = z.object({
  business_scope_id: z.number().array(),
});

export const UpdateBusinessScopeDto = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
});

export type UpdateBusinessScopeDto = z.infer<typeof UpdateBusinessScopeDto>;
export type AddNewBusinessScopeDto = z.infer<typeof AddNewBusinessScopeDto>;
export type AssignBusinessScopeToCompanyDto = z.infer<
  typeof AssignBusinessScopeToCompanyDto
>;
