import { SetMetadata } from '@nestjs/common';
import { AppRole } from '../enums/app-roles.enum';

export const ROLES_KEY = 'roles';

export interface RoleMetadata {
  roles: AppRole[];
}

export const Roles = (...roles: AppRole[]) =>
  SetMetadata(ROLES_KEY, { roles });
