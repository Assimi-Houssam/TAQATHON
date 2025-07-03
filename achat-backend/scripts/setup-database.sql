-- Setup database tables and default data for authentication system
-- Run this after starting PostgreSQL container

-- Create roles table
CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR UNIQUE NOT NULL,
    description VARCHAR,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create permissions table  
CREATE TABLE IF NOT EXISTS permissions (
    id SERIAL PRIMARY KEY,
    name VARCHAR UNIQUE NOT NULL,
    description VARCHAR,
    resource VARCHAR NOT NULL,
    action VARCHAR NOT NULL,
    scope VARCHAR,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create role_permissions junction table
CREATE TABLE IF NOT EXISTS role_permissions (
    role_id INTEGER REFERENCES roles(id) ON DELETE CASCADE,
    permission_id INTEGER REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

-- Create user_roles junction table (if users table exists)
CREATE TABLE IF NOT EXISTS user_roles (
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    role_id INTEGER REFERENCES roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

-- Add password column to users table if it doesn't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS password VARCHAR;

-- Remove keycloak_id column if it exists
ALTER TABLE users DROP COLUMN IF EXISTS keycloak_id;

-- Insert default roles
INSERT INTO roles (name, description) VALUES 
('ADMIN', 'Full system access'),
('OCP_AGENT', 'OCP agent with procurement management access'),
('SUPPLIER', 'Supplier with bidding and company management access'),
('VIEWER', 'Read-only access to relevant data')
ON CONFLICT (name) DO NOTHING;

-- Insert permissions
INSERT INTO permissions (name, resource, action, scope) VALUES
-- Bids permissions
('manage_all_bids', 'bids', 'manage', 'all'),
('read_own_bids', 'bids', 'read', 'own'),
('read_other_bids', 'bids', 'read', 'other'),
('modify_own_bids', 'bids', 'modify', 'own'),
('create_bids', 'bids', 'create', 'own'),
('read_all_bids', 'bids', 'read', 'all'),

-- Chats permissions
('manage_all_chats', 'chats', 'manage', 'all'),
('read_own_chats', 'chats', 'read', 'own'),
('read_other_chats', 'chats', 'read', 'other'),
('write_own_chats', 'chats', 'write', 'own'),
('create_chats', 'chats', 'create', 'own'),
('modify_own_chats', 'chats', 'modify', 'own'),

-- Users permissions
('manage_all_users', 'users', 'manage', 'all'),
('read_own_profile', 'users', 'read', 'own'),
('read_other_profiles', 'users', 'read', 'other'),
('modify_own_profile', 'users', 'modify', 'own'),
('manage_agents', 'users', 'manage', 'agents'),
('manage_suppliers', 'users', 'manage', 'suppliers'),
('create_suppliers', 'users', 'create', 'suppliers'),
('read_all_agents', 'users', 'read', 'agents'),
('read_all_suppliers', 'users', 'read', 'suppliers'),
('modify_own_answer', 'users', 'modify', 'answer'),

-- Purchase requests permissions
('manage_all_purchase_requests', 'purchase_requests', 'manage', 'all'),
('read_own_purchase_requests', 'purchase_requests', 'read', 'own'),
('read_other_purchase_requests', 'purchase_requests', 'read', 'other'),
('modify_own_purchase_requests', 'purchase_requests', 'modify', 'own'),
('create_purchase_requests', 'purchase_requests', 'create', 'own'),
('read_all_purchase_requests', 'purchase_requests', 'read', 'all'),

-- Companies permissions
('manage_all_companies', 'companies', 'manage', 'all'),
('read_own_company', 'companies', 'read', 'own'),
('read_other_companies', 'companies', 'read', 'other'),
('modify_own_company', 'companies', 'modify', 'own'),
('create_company', 'companies', 'create', 'own'),
('read_all_companies', 'companies', 'read', 'all'),

-- Notifications permissions
('manage_all_notifications', 'notifications', 'manage', 'all'),
('read_own_notifications', 'notifications', 'read', 'own'),
('modify_own_notifications', 'notifications', 'modify', 'own'),
('create_notifications', 'notifications', 'create', 'own'),

-- Feedback permissions
('create_feedback', 'feedback', 'create', 'own'),
('modify_own_feedback', 'feedback', 'modify', 'own'),
('read_all_feedbacks', 'feedback', 'read', 'all'),
('read_own_feedbacks', 'feedback', 'read', 'own'),

-- Todo permissions
('create_todo', 'todo', 'create', 'own'),
('modify_own_todo', 'todo', 'modify', 'own'),

-- Question permissions
('manage_questions', 'questions', 'manage', 'all'),
('create_questions', 'questions', 'create', 'own'),
('update_questions', 'questions', 'update', 'own'),
('delete_questions', 'questions', 'delete', 'own'),

-- Logs permissions
('read_all_logs', 'logs', 'read', 'all'),
('read_own_logs', 'logs', 'read', 'own'),

-- Reports permissions
('manage_all_reports', 'reports', 'manage', 'all'),
('read_own_reports', 'reports', 'read', 'own'),
('read_all_reports', 'reports', 'read', 'all'),
('create_report', 'reports', 'create', 'own'),
('close_report', 'reports', 'close', 'own')
ON CONFLICT (name) DO NOTHING;

-- Assign ALL permissions to ADMIN role
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id 
FROM roles r, permissions p 
WHERE r.name = 'ADMIN'
ON CONFLICT DO NOTHING;

-- Assign OCP_AGENT permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id 
FROM roles r, permissions p 
WHERE r.name = 'OCP_AGENT' 
  AND p.name IN (
    'manage_all_purchase_requests', 'read_all_purchase_requests', 'create_purchase_requests',
    'manage_all_bids', 'read_all_bids', 'read_all_companies', 'manage_suppliers',
    'read_all_suppliers', 'create_chats', 'manage_all_chats', 'read_own_profile',
    'modify_own_profile', 'read_all_logs', 'manage_all_reports', 'read_all_reports',
    'create_report', 'close_report'
  )
ON CONFLICT DO NOTHING;

-- Assign SUPPLIER permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id 
FROM roles r, permissions p 
WHERE r.name = 'SUPPLIER' 
  AND p.name IN (
    'read_own_purchase_requests', 'read_other_purchase_requests', 'create_bids',
    'read_own_bids', 'modify_own_bids', 'read_own_company', 'modify_own_company',
    'create_chats', 'read_own_chats', 'write_own_chats', 'modify_own_chats',
    'read_own_profile', 'modify_own_profile', 'create_feedback', 'modify_own_feedback',
    'read_own_feedbacks', 'create_report', 'read_own_reports', 'read_own_logs'
  )
ON CONFLICT DO NOTHING;

-- Assign VIEWER permissions (read-only)
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id 
FROM roles r, permissions p 
WHERE r.name = 'VIEWER' 
  AND p.name IN (
    'read_own_profile', 'read_own_purchase_requests', 'read_own_bids',
    'read_own_company', 'read_own_chats', 'read_own_feedbacks',
    'read_own_reports', 'read_own_logs'
  )
ON CONFLICT DO NOTHING;

-- Create test users (optional)
INSERT INTO users (
  username, email, password, first_name, last_name, full_name,
  entity_type, is_active, is_verified, created_at, updated_at
) VALUES 
(
  'admin',
  'admin@company.com',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqfq9BFNXTnh4P5BUuGTKLa', -- Admin123!
  'Admin',
  'User',
  'Admin User',
  'OCP_AGENT',
  true,
  true,
  NOW(),
  NOW()
),
(
  'supplier',
  'supplier@company.com',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqfq9BFNXTnh4P5BUuGTKLa', -- Supplier123!
  'John',
  'Supplier',
  'John Supplier',
  'SUPPLIER',
  true,
  true,
  NOW(),
  NOW()
)
ON CONFLICT (email) DO NOTHING;

-- Assign roles to test users
INSERT INTO user_roles (user_id, role_id) 
SELECT u.id, r.id 
FROM users u, roles r 
WHERE u.username = 'admin' AND r.name = 'ADMIN'
ON CONFLICT DO NOTHING;

INSERT INTO user_roles (user_id, role_id) 
SELECT u.id, r.id 
FROM users u, roles r 
WHERE u.username = 'supplier' AND r.name = 'SUPPLIER'
ON CONFLICT DO NOTHING;

-- Display results
SELECT 'Roles created:' as info;
SELECT id, name, description FROM roles ORDER BY id;

SELECT 'Test users created:' as info;
SELECT id, username, email, entity_type FROM users WHERE username IN ('admin', 'supplier');

SELECT 'User roles assigned:' as info;
SELECT u.username, r.name as role_name 
FROM users u 
JOIN user_roles ur ON u.id = ur.user_id 
JOIN roles r ON ur.role_id = r.id 
ORDER BY u.username; 