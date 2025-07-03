#!/bin/bash
set -e

# Database initialization script
# Add your custom database users and databases here

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname="postgres" <<-EOSQL
    -- Example: Create a custom user (uncomment and modify as needed)
    -- DO \$\$
    -- BEGIN
    --     CREATE USER your_username WITH PASSWORD 'your_password';
    --     EXCEPTION WHEN duplicate_object THEN
    --     RAISE NOTICE 'User your_username already exists';
    -- END\$\$;
    
    -- Example: Create a custom database (uncomment and modify as needed)
    -- SELECT 'CREATE DATABASE your_database'
    -- WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'your_database')\gexec
    
    -- Example: Grant privileges (uncomment and modify as needed)
    -- GRANT ALL PRIVILEGES ON DATABASE your_database TO your_username;
EOSQL

echo "Database initialization completed!"
