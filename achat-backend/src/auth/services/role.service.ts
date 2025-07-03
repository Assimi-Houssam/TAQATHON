import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../entities/role.entity';
import { Permission } from '../entities/permission.entity';
import { User } from 'src/users/entities/user.entity';
import { AppRole } from '../enums/app-roles.enum';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(Permission)
    public permissionRepository: Repository<Permission>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async createRole(name: string, description?: string): Promise<Role> {
    const role = this.roleRepository.create({ name, description });
    return this.roleRepository.save(role);
  }

  async createPermission(
    name: string,
    resource: string,
    action: string,
    scope?: string,
    description?: string,
  ): Promise<Permission> {
    const permission = this.permissionRepository.create({
      name,
      resource,
      action,
      scope,
      description,
    });
    return this.permissionRepository.save(permission);
  }

  async assignPermissionToRole(roleId: number, permissionId: number): Promise<void> {
    const role = await this.roleRepository.findOne({
      where: { id: roleId },
      relations: ['permissions'],
    });
    const permission = await this.permissionRepository.findOne({
      where: { id: permissionId },
    });

    if (!role || !permission) {
      throw new NotFoundException('Role or permission not found');
    }

    role.permissions = role.permissions || [];
    if (!role.permissions.find(p => p.id === permissionId)) {
      role.permissions.push(permission);
      await this.roleRepository.save(role);
    }
  }

  async assignRoleToUser(userId: number, roleId: number): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['roles'],
    });
    const role = await this.roleRepository.findOne({
      where: { id: roleId },
    });

    if (!user || !role) {
      throw new NotFoundException('User or role not found');
    }

    user.roles = user.roles || [];
    if (!user.roles.find(r => r.id === roleId)) {
      user.roles.push(role);
      await this.userRepository.save(user);
    }
  }

  async removeRoleFromUser(userId: number, roleId: number): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['roles'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.roles = user.roles.filter(role => role.id !== roleId);
    await this.userRepository.save(user);
  }

  async getUserRoles(userId: number): Promise<Role[]> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['roles', 'roles.permissions'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user.roles || [];
  }

  async getUserPermissions(userId: number): Promise<string[]> {
    const roles = await this.getUserRoles(userId);
    const permissions = new Set<string>();

    roles.forEach(role => {
      role.permissions?.forEach(permission => {
        permissions.add(permission.name);
      });
    });

    return Array.from(permissions);
  }

  async hasPermission(userId: number, permissionName: string): Promise<boolean> {
    const permissions = await this.getUserPermissions(userId);
    return permissions.includes(permissionName);
  }

  async getRoleByName(name: string): Promise<Role | null> {
    return this.roleRepository.findOne({
      where: { name },
      relations: ['permissions'],
    });
  }

  async initializeDefaultRoles(): Promise<void> {
    // Create default roles based on entity types
    const defaultRoles = [
      { name: 'ADMIN', description: 'Full system access' },
      { name: 'OCP_AGENT', description: 'OCP agent with procurement management access' },
      { name: 'SUPPLIER', description: 'Supplier with bidding and company management access' },
      { name: 'VIEWER', description: 'Read-only access to relevant data' },
    ];

    for (const roleData of defaultRoles) {
      const existingRole = await this.getRoleByName(roleData.name);
      if (!existingRole) {
        await this.createRole(roleData.name, roleData.description);
      }
    }
  }

  async initializeDefaultPermissions(): Promise<void> {
    // Create permissions based on the AppRole enum
    const permissionsData = [
      // Bids
      { name: AppRole.MANAGE_ALL_BIDS, resource: 'bids', action: 'manage', scope: 'all' },
      { name: AppRole.READ_OWN_BIDS, resource: 'bids', action: 'read', scope: 'own' },
      { name: AppRole.CREATE_BIDS, resource: 'bids', action: 'create', scope: 'own' },
      
      // Chats
      { name: AppRole.MANAGE_ALL_CHATS, resource: 'chats', action: 'manage', scope: 'all' },
      { name: AppRole.READ_OWN_CHATS, resource: 'chats', action: 'read', scope: 'own' },
      { name: AppRole.CREATE_CHATS, resource: 'chats', action: 'create', scope: 'own' },
      
      // Users
      { name: AppRole.MANAGE_ALL_USERS, resource: 'users', action: 'manage', scope: 'all' },
      { name: AppRole.READ_OWN_PROFILE, resource: 'users', action: 'read', scope: 'own' },
      { name: AppRole.MODIFY_OWN_PROFILE, resource: 'users', action: 'modify', scope: 'own' },
      
      // Purchase Requests
      { name: AppRole.MANAGE_ALL_PURCHASE_REQUESTS, resource: 'purchase_requests', action: 'manage', scope: 'all' },
      { name: AppRole.READ_OWN_PURCHASE_REQUESTS, resource: 'purchase_requests', action: 'read', scope: 'own' },
      { name: AppRole.CREATE_PURCHASE_REQUESTS, resource: 'purchase_requests', action: 'create', scope: 'own' },
      
      // Companies
      { name: AppRole.MANAGE_ALL_COMPANIES, resource: 'companies', action: 'manage', scope: 'all' },
      { name: AppRole.READ_OWN_COMPANY, resource: 'companies', action: 'read', scope: 'own' },
      { name: AppRole.MODIFY_OWN_COMPANY, resource: 'companies', action: 'modify', scope: 'own' },
      
      // Add more as needed...
    ];

    for (const permData of permissionsData) {
      const existing = await this.permissionRepository.findOne({
        where: { name: permData.name },
      });
      if (!existing) {
        await this.createPermission(
          permData.name,
          permData.resource,
          permData.action,
          permData.scope,
        );
      }
    }
  }
} 