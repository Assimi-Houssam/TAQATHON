import { MigrationInterface, QueryRunner, Table, Index } from 'typeorm';

export class CreateRolesPermissions1710000000015 implements MigrationInterface {
  name = 'CreateRolesPermissions1710000000015';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create roles table
    await queryRunner.createTable(
      new Table({
        name: 'roles',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'name',
            type: 'varchar',
            isUnique: true,
          },
          {
            name: 'description',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'NOW()',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'NOW()',
          },
        ],
      }),
    );

    // Create permissions table
    await queryRunner.createTable(
      new Table({
        name: 'permissions',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'name',
            type: 'varchar',
            isUnique: true,
          },
          {
            name: 'description',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'resource',
            type: 'varchar',
          },
          {
            name: 'action',
            type: 'varchar',
          },
          {
            name: 'scope',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'NOW()',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'NOW()',
          },
        ],
      }),
    );

    // Create role_permissions junction table
    await queryRunner.createTable(
      new Table({
        name: 'role_permissions',
        columns: [
          {
            name: 'role_id',
            type: 'int',
          },
          {
            name: 'permission_id',
            type: 'int',
          },
        ],
        foreignKeys: [
          {
            columnNames: ['role_id'],
            referencedTableName: 'roles',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
          {
            columnNames: ['permission_id'],
            referencedTableName: 'permissions',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
        ],
        indices: [
          {
            name: 'IDX_role_permissions_role_id',
            columnNames: ['role_id'],
          },
          {
            name: 'IDX_role_permissions_permission_id',
            columnNames: ['permission_id'],
          },
        ],
      }),
    );

    // Create user_roles junction table
    await queryRunner.createTable(
      new Table({
        name: 'user_roles',
        columns: [
          {
            name: 'user_id',
            type: 'int',
          },
          {
            name: 'role_id',
            type: 'int',
          },
        ],
        foreignKeys: [
          {
            columnNames: ['user_id'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
          {
            columnNames: ['role_id'],
            referencedTableName: 'roles',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
        ],
        indices: [
          {
            name: 'IDX_user_roles_user_id',
            columnNames: ['user_id'],
          },
          {
            name: 'IDX_user_roles_role_id',
            columnNames: ['role_id'],
          },
        ],
      }),
    );

    // Add password column to users table (if not exists)
    const hasPasswordColumn = await queryRunner.hasColumn('users', 'password');
    if (!hasPasswordColumn) {
      await queryRunner.query(`
        ALTER TABLE "users" ADD COLUMN "password" varchar
      `);
    }

    // Remove keycloak_id column from users table (if exists)
    const hasKeycloakIdColumn = await queryRunner.hasColumn('users', 'keycloak_id');
    if (hasKeycloakIdColumn) {
      await queryRunner.query(`
        ALTER TABLE "users" DROP COLUMN "keycloak_id"
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop junction tables first
    await queryRunner.dropTable('user_roles');
    await queryRunner.dropTable('role_permissions');
    
    // Drop main tables
    await queryRunner.dropTable('permissions');
    await queryRunner.dropTable('roles');

    // Add back keycloak_id column
    await queryRunner.query(`
      ALTER TABLE "users" ADD COLUMN "keycloak_id" varchar
    `);

    // Remove password column
    const hasPasswordColumn = await queryRunner.hasColumn('users', 'password');
    if (hasPasswordColumn) {
      await queryRunner.query(`
        ALTER TABLE "users" DROP COLUMN "password"
      `);
    }
  }
} 