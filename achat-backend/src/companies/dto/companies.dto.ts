import { PaginationDto, paginationSchema } from 'src/common/dto/pagination.dto';
import { phoneSchema } from 'src/users/dto/schemas/phone-schema';
import { createZodDto } from '../../../utils/zod-dto';
import { z } from 'zod';
import {
  Certifications,
  CompanyLockActionDto,
  LegalForms,
  CompanyStatus,
  CompanyApprovalStatus,
} from '../enums/company.enum';

export const getCompaniesSchema = z.object({
  ...paginationSchema.shape,
  search: z.string().optional(),
  city: z.string().optional(),
  phone: z.string().optional(),
  business_scope_ids: z.string()
    .transform((val) => val.split(',').map(Number))
    .pipe(z.array(z.number()))
    .optional(),
  status: z.nativeEnum(CompanyStatus).optional(),
  approval_status: z.string()
    .transform((val) => val.split(','))
    .pipe(z.array(z.nativeEnum(CompanyApprovalStatus)))
    .optional(),
});

export class GetCompaniesDto extends createZodDto(getCompaniesSchema) {}

export const createCompanySchema = z.object({
  basicInfo: z.object({
    legalName: z.string().min(1, 'Required'),
    commercialName: z.string().min(1, 'Required'),
    legalForm: z.nativeEnum(LegalForms),
    ICE: z.string().min(1, 'Required'),
    siretNumber: z.string().optional(),
    vatNumber: z.string().optional(),
  }),

  contact: z.object({
    primaryContact: z.string().min(1, 'Required'),
    email: z.string().email().min(1, 'Required'),
    primaryPhone: z.string().min(1, 'Required'),
    secondaryPhone: z.string().optional(),
  }),

  address: z.object({
    registeredOffice: z.string().min(1, 'Required'),
    headquarters: z.string().min(1, 'Required'),
    branchLocations: z.string().min(1, 'Required'),
  }),

  legal: z.object({
    businessActivities: z.array(z.string()).min(1, 'Required'),
    industryCode: z.string().optional(),
    certifications: z.nativeEnum(Certifications).array(),
    otherCertifications: z.string().optional(),
  }),

  documents: z.object({
    companyStatutes: z.array(z.string()),
    termsOfUseAndAccess: z.array(z.string()),
    commercialRegistry: z.array(z.string()),
    financialStatements: z.array(z.string()),
    clientReferences: z.array(z.string()).optional(),
  }),

  additional: z.array(
    z.object({
      formfieldId: z.number(),
      content: z.any(),
    }),
  ),
});

export class CreateCompanyDto extends createZodDto(createCompanySchema) {}

// Response DTO for better type safety
export const companyResponseSchema = createCompanySchema.extend({
  id: z.number(),
  created_at: z.date(),
  updated_at: z.date(),
  status: z.string(),
  certificates: z
    .array(
      z.object({
        id: z.string().uuid(),
        fileName: z.string(),
        originalName: z.string(),
        mimeType: z.string(),
        size: z.number(),
        name: z.string(),
        expiry_date: z.date(),
        description: z.string().optional(),
      }),
    )
    .optional(),
});

export type CompanyResponse = z.infer<typeof companyResponseSchema>;

export const inviteUserSchema = z.object({
  email: z.string().email(),
});

export class InviteUserDto extends createZodDto(inviteUserSchema) {}

export const toggleLockCompanySchema = z
  .object({
    action: z.nativeEnum(CompanyLockActionDto),
    reason: z.string().min(10).max(500).optional(),
  })
  .refine((data) => {
    if (data.action === CompanyLockActionDto.LOCK && !data.reason) {
      return false;
    }
    return true;
  });

export class ToggleLockCompanyDto extends createZodDto(
  toggleLockCompanySchema,
) {}

export const verifyCompanySchema = z.object({
  approvalStatus: z.enum(['APPROVED', 'REJECTED']),
  rejectionReason: z.string().min(10).max(500).optional(),
});

export class VerifyCompanyDto extends createZodDto(verifyCompanySchema) {}
