import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { RoleService } from '../src/auth/services/role.service';
import { Logger } from '@nestjs/common';
import { AppRole } from '../src/auth/enums/app-roles.enum';

async function initializeRolesAndPermissions() {
  const logger = new Logger('RoleInitializer');
  
  try {
    const app = await NestFactory.createApplicationContext(AppModule);
    const roleService = app.get(RoleService);

    logger.log('Initializing default roles...');
    await roleService.initializeDefaultRoles();

    logger.log('Initializing default permissions...');
    await roleService.initializeDefaultPermissions();

    // Assign permissions to roles
    logger.log('Assigning permissions to roles...');

    const adminRole = await roleService.getRoleByName('ADMIN');
    const ocpAgentRole = await roleService.getRoleByName('OCP_AGENT');
    const supplierRole = await roleService.getRoleByName('SUPPLIER');
    const viewerRole = await roleService.getRoleByName('VIEWER');

    if (adminRole) {
      // Admin gets all permissions
      const allPermissions = Object.values(AppRole);
      for (const permission of allPermissions) {
        const permissionEntity = await roleService.permissionRepository.findOne({
          where: { name: permission },
        });
        if (permissionEntity) {
          await roleService.assignPermissionToRole(adminRole.id, permissionEntity.id);
        }
      }
      logger.log('Admin role configured with all permissions');
    }

    if (ocpAgentRole) {
      // OCP Agent permissions
      const agentPermissions = [
        AppRole.MANAGE_ALL_PURCHASE_REQUESTS,
        AppRole.READ_ALL_PURCHASE_REQUESTS,
        AppRole.CREATE_PURCHASE_REQUESTS,
        AppRole.MANAGE_ALL_BIDS,
        AppRole.READ_ALL_BIDS,
        AppRole.READ_ALL_COMPANIES,
        AppRole.MANAGE_SUPPLIERS,
        AppRole.READ_ALL_SUPPLIERS,
        AppRole.CREATE_CHATS,
        AppRole.MANAGE_ALL_CHATS,
        AppRole.READ_OWN_PROFILE,
        AppRole.MODIFY_OWN_PROFILE,
        AppRole.READ_ALL_LOGS,
        AppRole.MANAGE_ALL_REPORTS,
        AppRole.READ_ALL_REPORTS,
        AppRole.CREATE_REPORT,
        AppRole.CLOSE_REPORT,
      ];

      for (const permission of agentPermissions) {
        const permissionEntity = await roleService.permissionRepository.findOne({
          where: { name: permission },
        });
        if (permissionEntity) {
          await roleService.assignPermissionToRole(ocpAgentRole.id, permissionEntity.id);
        }
      }
      logger.log('OCP Agent role configured with agent permissions');
    }

    if (supplierRole) {
      // Supplier permissions
      const supplierPermissions = [
        AppRole.READ_OWN_PURCHASE_REQUESTS,
        AppRole.READ_OTHER_PURCHASE_REQUESTS,
        AppRole.CREATE_BIDS,
        AppRole.READ_OWN_BIDS,
        AppRole.MODIFY_OWN_BIDS,
        AppRole.READ_OWN_COMPANY,
        AppRole.MODIFY_OWN_COMPANY,
        AppRole.CREATE_CHATS,
        AppRole.READ_OWN_CHATS,
        AppRole.WRITE_OWN_CHATS,
        AppRole.MODIFY_OWN_CHATS,
        AppRole.READ_OWN_PROFILE,
        AppRole.MODIFY_OWN_PROFILE,
        AppRole.CREATE_FEEDBACK,
        AppRole.MODIFY_OWN_FEEDBACK,
        AppRole.READ_OWN_FEEDBACKS,
        AppRole.CREATE_REPORT,
        AppRole.READ_OWN_REPORTS,
        AppRole.READ_OWN_LOGS,
      ];

      for (const permission of supplierPermissions) {
        const permissionEntity = await roleService.permissionRepository.findOne({
          where: { name: permission },
        });
        if (permissionEntity) {
          await roleService.assignPermissionToRole(supplierRole.id, permissionEntity.id);
        }
      }
      logger.log('Supplier role configured with supplier permissions');
    }

    if (viewerRole) {
      // Viewer permissions (read-only)
      const viewerPermissions = [
        AppRole.READ_OWN_PROFILE,
        AppRole.READ_OWN_PURCHASE_REQUESTS,
        AppRole.READ_OWN_BIDS,
        AppRole.READ_OWN_COMPANY,
        AppRole.READ_OWN_CHATS,
        AppRole.READ_OWN_FEEDBACKS,
        AppRole.READ_OWN_REPORTS,
        AppRole.READ_OWN_LOGS,
      ];

      for (const permission of viewerPermissions) {
        const permissionEntity = await roleService.permissionRepository.findOne({
          where: { name: permission },
        });
        if (permissionEntity) {
          await roleService.assignPermissionToRole(viewerRole.id, permissionEntity.id);
        }
      }
      logger.log('Viewer role configured with read-only permissions');
    }

    logger.log('✅ Roles and permissions initialized successfully!');
    await app.close();
  } catch (error) {
    logger.error('❌ Failed to initialize roles and permissions:', error);
    process.exit(1);
  }
}

initializeRolesAndPermissions(); 