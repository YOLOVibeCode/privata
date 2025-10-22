-- Initialize PostgreSQL Identity Database (PII Data)
-- This database stores personally identifiable information

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table for PII data
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pseudonym VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    ssn VARCHAR(11),
    date_of_birth DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_pseudonym ON users(pseudonym);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- Insert sample PII data
INSERT INTO users (pseudonym, first_name, last_name, email, phone, address, ssn, date_of_birth) VALUES
('PSEUDO_001', 'John', 'Doe', 'john.doe@example.com', '+1-555-0101', '123 Main St, Anytown, USA', '123-45-6789', '1985-03-15'),
('PSEUDO_002', 'Jane', 'Smith', 'jane.smith@example.com', '+1-555-0102', '456 Oak Ave, Somewhere, USA', '987-65-4321', '1990-07-22'),
('PSEUDO_003', 'Bob', 'Johnson', 'bob.johnson@example.com', '+1-555-0103', '789 Pine Rd, Elsewhere, USA', '456-78-9012', '1978-11-08');

-- Audit table for compliance tracking
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
