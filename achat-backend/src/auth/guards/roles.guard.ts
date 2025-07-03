import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY, RoleMetadata } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roleMetadata = this.reflector.getAllAndOverride<RoleMetadata>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!roleMetadata) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user || !user.permissions) {
      return false;
    }

    const { roles } = roleMetadata;

    // Check if user has any of the required permissions
    return roles.some((role) => user.permissions.includes(role));
  }
}
