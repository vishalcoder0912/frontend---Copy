-- Migration script for Staff table
-- Run this script to ensure staff table exists with proper structure and sample data

-- =============================================
-- STAFF TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS staff (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  employee_code VARCHAR(20) UNIQUE NOT NULL,
  department_id INTEGER REFERENCES departments(id) ON DELETE SET NULL,
  position VARCHAR(50),
  salary DECIMAL(10,2),
  join_date DATE,
  phone VARCHAR(20),
  status VARCHAR(20) NOT NULL DEFAULT 'Active',
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  deleted_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_staff_code ON staff(employee_code);
CREATE INDEX IF NOT EXISTS idx_staff_user ON staff(user_id);
CREATE INDEX IF NOT EXISTS idx_staff_department ON staff(department_id);
CREATE INDEX IF NOT EXISTS idx_staff_status ON staff(status);
CREATE INDEX IF NOT EXISTS idx_staff_position ON staff(position);

-- =============================================
-- INSERT SAMPLE USERS (if not exist)
-- =============================================
INSERT INTO users (name, email, password_hash, role, status) VALUES
  ('Priya Sharma', 'priya@hospital.com', '$2b$10$dummy_hash_1', 'nurse', 'Active'),
  ('Rajesh Kumar', 'rajesh@hospital.com', '$2b$10$dummy_hash_2', 'receptionist', 'Active'),
  ('Anita Verma', 'anita@hospital.com', '$2b$10$dummy_hash_3', 'pharmacist', 'Active'),
  ('Vikram Singh', 'vikram@hospital.com', '$2b$10$dummy_hash_4', 'lab_technician', 'Active'),
  ('Meera Patel', 'meera@hospital.com', '$2b$10$dummy_hash_5', 'staff', 'Active'),
  ('Suresh Rao', 'suresh@hospital.com', '$2b$10$dummy_hash_6', 'staff', 'Active'),
  ('Kavita Joshi', 'kavita@hospital.com', '$2b$10$dummy_hash_7', 'nurse', 'Active'),
  ('Arun Mehta', 'arun@hospital.com', '$2b$10$dummy_hash_8', 'receptionist', 'Active'),
  ('Sunita Desai', 'sunita@hospital.com', '$2b$10$dummy_hash_9', 'pharmacist', 'Active'),
  ('Deepak Gupta', 'deepak@hospital.com', '$2b$10$dummy_hash_10', 'lab_technician', 'Active'),
  ('Neha Shah', 'neha@hospital.com', '$2b$10$dummy_hash_11', 'staff', 'Active'),
  ('Rahul Iyer', 'rahul@hospital.com', '$2b$10$dummy_hash_12', 'nurse', 'Active'),
  ('Pooja Nair', 'pooja@hospital.com', '$2b$10$dummy_hash_13', 'staff', 'Inactive'),
  ('Amit Chatterjee', 'amit@hospital.com', '$2b$10$dummy_hash_14', 'staff', 'Active'),
  ('Lakshmi Reddy', 'lakshmi@hospital.com', '$2b$10$dummy_hash_15', 'receptionist', 'Active')
ON CONFLICT (email) DO NOTHING;

-- =============================================
-- INSERT SAMPLE STAFF (linked to users and departments)
-- =============================================
INSERT INTO staff (user_id, employee_code, department_id, position, salary, join_date, phone, status)
SELECT 
  u.id,
  'EMP' || LPAD(CAST(ROW_NUMBER() OVER (ORDER BY u.id) AS VARCHAR), 4, '0'),
  CASE 
    WHEN u.role = 'nurse' THEN (SELECT id FROM departments WHERE name = 'ICU' LIMIT 1)
    WHEN u.role = 'receptionist' THEN (SELECT id FROM departments WHERE name = 'General Medicine' LIMIT 1)
    WHEN u.role = 'pharmacist' THEN (SELECT id FROM departments WHERE name = 'General Medicine' LIMIT 1)
    WHEN u.role = 'lab_technician' THEN (SELECT id FROM departments WHERE name = 'Emergency' LIMIT 1)
    ELSE (SELECT id FROM departments WHERE name = 'General Medicine' LIMIT 1)
  END,
  INITCAP(u.role),
  CASE 
    WHEN u.role = 'nurse' THEN 45000 + (RANDOM() * 10000)
    WHEN u.role = 'pharmacist' THEN 40000 + (RANDOM() * 8000)
    WHEN u.role = 'lab_technician' THEN 50000 + (RANDOM() * 12000)
    ELSE 30000 + (RANDOM() * 5000)
  END,
  CURRENT_DATE - (RANDOM() * 365 * 3)::INTEGER,
  '+91 ' || SUBSTR(CAST(CAST(RANDOM() * 9000000000 + 1000000000 AS BIGINT) AS VARCHAR), 1, 10),
  u.status
FROM users u
WHERE u.role IN ('nurse', 'receptionist', 'pharmacist', 'lab_technician', 'staff')
AND u.id NOT IN (SELECT COALESCE(user_id, 0) FROM staff WHERE user_id IS NOT NULL)
ON CONFLICT (employee_code) DO NOTHING;

-- Insert additional staff with manual data
INSERT INTO staff (user_id, employee_code, department_id, position, salary, join_date, phone, status) VALUES
  ((SELECT id FROM users WHERE email = 'admin@hospital.com' LIMIT 1), 'EMP0001', 
    (SELECT id FROM departments WHERE name = 'General Medicine' LIMIT 1), 'Administrator', 75000, 
    '2022-01-15', '+91 9876543210', 'Active'),
  ((SELECT id FROM users WHERE email = 'admin@hospital.com' LIMIT 1), 'EMP0002', 
    (SELECT id FROM departments WHERE name = 'Emergency' LIMIT 1), 'Emergency Coordinator', 55000, 
    '2022-03-20', '+91 9876543211', 'Active')
ON CONFLICT (employee_code) DO NOTHING;

-- =============================================
-- UPDATE POSITIONS TO MORE DESCRIPTIVE NAMES
-- =============================================
UPDATE staff SET position = 
  CASE 
    WHEN position = 'Nurse' THEN 'Staff Nurse'
    WHEN position = 'Receptionist' THEN 'Front Desk Executive'
    WHEN position = 'Pharmacist' THEN 'Chief Pharmacist'
    WHEN position = 'Lab_technician' THEN 'Lab Technician'
    WHEN position = 'Staff' THEN 'Support Staff'
    ELSE position
  END
WHERE position IN ('Nurse', 'Receptionist', 'Pharmacist', 'Lab_technician', 'Staff');

-- =============================================
-- VERIFICATION
-- =============================================
-- SELECT 'Total Staff: ' || COUNT(*) FROM staff;
-- SELECT department_name, COUNT(*) as count FROM staff s LEFT JOIN departments d ON s.department_id = d.id GROUP BY department_name;
-- SELECT status, COUNT(*) as count FROM staff GROUP BY status;
-- SELECT position, COUNT(*) as count FROM staff GROUP BY position;
