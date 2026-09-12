
-- CampusOps Incident Management System Schema


-- Clean up existing tables if re-running
DROP TABLE IF EXISTS incident_comments CASCADE;
DROP TABLE IF EXISTS incident_history CASCADE;
DROP TABLE IF EXISTS incidents CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS roles CASCADE;

-- 1. Roles Table
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT
);

-- 2. Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role_id INT NOT NULL REFERENCES roles(id) ON DELETE RESTRICT,
    student_id VARCHAR(50),
    department VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Incidents Table
CREATE TABLE incidents (
    id SERIAL PRIMARY KEY,
    incident_number VARCHAR(20) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(50) NOT NULL, -- 'IT Support', 'Facilities', 'Security', 'Network', 'Classroom AV'
    location VARCHAR(150) NOT NULL,
    priority VARCHAR(20) NOT NULL DEFAULT 'MEDIUM', -- 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
    status VARCHAR(20) NOT NULL DEFAULT 'REPORTED', -- 'REPORTED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'
    reported_by INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    assigned_to INT REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Incident Comments / Activity Feed Table
CREATE TABLE incident_comments (
    id SERIAL PRIMARY KEY,
    incident_id INT NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    comment TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Incident History / Audit Log Table
CREATE TABLE incident_history (
    id SERIAL PRIMARY KEY,
    incident_id INT NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    old_status VARCHAR(20),
    new_status VARCHAR(20) NOT NULL,
    changed_by INT REFERENCES users(id) ON DELETE SET NULL,
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_incidents_status ON incidents(status);
CREATE INDEX idx_incidents_category ON incidents(category);
CREATE INDEX idx_incidents_reported_by ON incidents(reported_by);
CREATE INDEX idx_incidents_assigned_to ON incidents(assigned_to);


-- Initial Seed Data


-- Insert Default Roles
INSERT INTO roles (id, name, description) VALUES
    (1, 'STUDENT', 'University student reporting and tracking campus incidents'),
    (2, 'FACULTY', 'Academic and administrative campus staff'),
    (3, 'TECHNICIAN', 'Field technician resolving assigned tickets and incidents'),
    (4, 'ADMIN', 'System administrator monitoring system health and analytics');

-- Insert Initial Users (matches your frontend mock data)
INSERT INTO users (id, name, email, password_hash, role_id, student_id, department) VALUES
    (1, 'Sandul Rasanjana', 'sandul@campus.ac.lk', '$2b$10$demoHashStudentPass', 1, 'STU-89241', 'Information Systems'),
    (2, 'Alex Rivers', 'tech.alex@campus.ac.lk', '$2b$10$demoHashTechPass', 3, 'EMP-1022', 'Campus IT Services'),
    (3, 'Eleanor Vance', 'admin@campus.ac.lk', '$2b$10$demoHashAdminPass', 4, 'EMP-0014', 'Infrastructure & Operations');

-- Insert Initial Incidents
INSERT INTO incidents (incident_number, title, description, category, location, priority, status, reported_by, assigned_to, created_at) VALUES
    ('INC-1042', 'Projector malfunction in Room 302', 'HDMI port flickers repeatedly and cuts out during lecture slides.', 'Classroom AV', 'Computing Complex - Room 302', 'HIGH', 'IN_PROGRESS', 1, 2, CURRENT_TIMESTAMP - INTERVAL '2 hours'),
    ('INC-1038', 'Leaking pipe in North Wing Restroom', 'Water leaking onto the floor near sink basin, potential slip hazard.', 'Facilities', 'North Wing 2nd Floor', 'MEDIUM', 'REPORTED', 1, NULL, CURRENT_TIMESTAMP - INTERVAL '1 day'),
    ('INC-1035', 'Wi-Fi connectivity dropping in Library', 'Eduroam access point frequently dropping connections during peak hours.', 'Network', 'Main Library 1st Floor', 'MEDIUM', 'RESOLVED', 1, 2, CURRENT_TIMESTAMP - INTERVAL '2 days');

-- Insert Sample Comments
INSERT INTO incident_comments (incident_id, user_id, comment, created_at) VALUES
    (1, 1, 'Issue started around 09:15 during CS lecture.', CURRENT_TIMESTAMP - INTERVAL '1 hour 45 minutes'),
    (1, 2, 'Technician assigned. Replacing HDMI wall connector module.', CURRENT_TIMESTAMP - INTERVAL '30 minutes');

-- Reset sequences to prevent ID conflict on next INSERT
SELECT setval('roles_id_seq', (SELECT MAX(id) FROM roles));
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));
SELECT setval('incidents_id_seq', (SELECT MAX(id) FROM incidents));