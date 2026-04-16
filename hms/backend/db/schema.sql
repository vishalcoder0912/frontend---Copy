DROP TABLE IF EXISTS admissions CASCADE;
DROP TABLE IF EXISTS billing CASCADE;
DROP TABLE IF EXISTS lab_orders CASCADE;
DROP TABLE IF EXISTS pharmacy CASCADE;
DROP TABLE IF EXISTS appointments CASCADE;
DROP TABLE IF EXISTS doctors CASCADE;
DROP TABLE IF EXISTS patients CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS beds CASCADE;
DROP TABLE IF EXISTS departments CASCADE;

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'staff',
  status VARCHAR(20) NOT NULL DEFAULT 'Active',
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  deleted_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE patients (
  id SERIAL PRIMARY KEY,
  patient_code VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  age INTEGER NOT NULL,
  gender VARCHAR(20) NOT NULL,
  blood_type VARCHAR(5) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(100) UNIQUE,
  address TEXT,
  medical_history TEXT,
  last_visit DATE,
  status VARCHAR(20) NOT NULL DEFAULT 'Active',
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  deleted_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE doctors (
  id SERIAL PRIMARY KEY,
  doctor_code VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  specialization VARCHAR(100) NOT NULL,
  qualification VARCHAR(100),
  experience INTEGER NOT NULL DEFAULT 0,
  phone VARCHAR(20),
  email VARCHAR(100) UNIQUE,
  availability VARCHAR(20) NOT NULL DEFAULT 'Available',
  rating DECIMAL(2,1) NOT NULL DEFAULT 0,
  bio TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'Active',
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  deleted_at TIMESTAMP,
  working_hours JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE appointments (
  id SERIAL PRIMARY KEY,
  appointment_code VARCHAR(20) UNIQUE NOT NULL,
  patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id INTEGER NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  appointment_date TIMESTAMP NOT NULL,
  duration INTEGER NOT NULL DEFAULT 30,
  type VARCHAR(100) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'Booked',
  status_reason TEXT,
  notes TEXT,
  symptoms TEXT,
  prescription TEXT,
  follow_up_date DATE,
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  deleted_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_appointments_date ON appointments(appointment_date);

CREATE TABLE appointment_status_history (
  id SERIAL PRIMARY KEY,
  appointment_id INTEGER NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  previous_status VARCHAR(20),
  new_status VARCHAR(20) NOT NULL,
  reason TEXT,
  changed_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  changed_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_status_history_appointment ON appointment_status_history(appointment_id);
CREATE INDEX idx_status_history_changed_at ON appointment_status_history(changed_at);

CREATE TABLE billing (
  id SERIAL PRIMARY KEY,
  invoice_id VARCHAR(20) UNIQUE NOT NULL,
  patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id INTEGER NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  appointment_id INTEGER REFERENCES appointments(id) ON DELETE SET NULL,
  amount DECIMAL(10,2) NOT NULL,
  discount DECIMAL(10,2) NOT NULL DEFAULT 0,
  tax DECIMAL(10,2) NOT NULL DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'Pending',
  payment_method VARCHAR(50),
  invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE,
  paid_at TIMESTAMP,
  notes TEXT,
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  deleted_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE lab_orders (
  id SERIAL PRIMARY KEY,
  patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id INTEGER NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  test_name VARCHAR(150) NOT NULL,
  result TEXT,
  file_urls JSONB DEFAULT '[]'::jsonb,
  analyzed_data JSONB DEFAULT '{}'::jsonb,
  test_category VARCHAR(50),
  priority VARCHAR(20) DEFAULT 'Routine',
  specimen_type VARCHAR(50),
  specimen_id VARCHAR(30),
  status VARCHAR(20) NOT NULL DEFAULT 'Pending',
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  deleted_at TIMESTAMP,
  ordered_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE pharmacy (
  id SERIAL PRIMARY KEY,
  medicine_name VARCHAR(150) NOT NULL UNIQUE,
  manufacturer VARCHAR(150),
  stock INTEGER NOT NULL DEFAULT 0,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'Active',
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  deleted_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_patients_code ON patients(patient_code);
CREATE INDEX idx_patients_status ON patients(status);
CREATE INDEX idx_patients_name ON patients(name);
CREATE INDEX idx_patients_deleted ON patients(is_deleted);
CREATE INDEX idx_doctors_code ON doctors(doctor_code);
CREATE INDEX idx_doctors_specialization ON doctors(specialization);
CREATE INDEX idx_doctors_availability ON doctors(availability);
CREATE INDEX idx_doctors_deleted ON doctors(is_deleted);
CREATE INDEX idx_appointments_code ON appointments(appointment_code);
CREATE INDEX idx_appointments_patient ON appointments(patient_id);
CREATE INDEX idx_appointments_doctor ON appointments(doctor_id);
CREATE INDEX idx_appointments_date ON appointments(appointment_date);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_appointments_status_date ON appointments(status, appointment_date);
CREATE INDEX idx_appointments_deleted ON appointments(is_deleted);
CREATE INDEX idx_billing_invoice ON billing(invoice_id);
CREATE INDEX idx_billing_patient ON billing(patient_id);
CREATE INDEX idx_billing_doctor ON billing(doctor_id);
CREATE INDEX idx_billing_status ON billing(status);
CREATE INDEX idx_billing_date ON billing(invoice_date);
CREATE INDEX idx_billing_status_total ON billing(status, total);
CREATE INDEX idx_billing_deleted ON billing(is_deleted);
CREATE INDEX idx_lab_patient ON lab_orders(patient_id);
CREATE INDEX idx_lab_doctor ON lab_orders(doctor_id);
CREATE INDEX idx_lab_status ON lab_orders(status);
CREATE INDEX idx_lab_deleted ON lab_orders(is_deleted);
CREATE INDEX idx_pharmacy_name ON pharmacy(medicine_name);
CREATE INDEX idx_pharmacy_deleted ON pharmacy(is_deleted);

CREATE TABLE audit_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(50) NOT NULL,
  entity VARCHAR(50) NOT NULL,
  entity_id INTEGER,
  old_values JSONB,
  new_values JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  timestamp TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity);
CREATE INDEX idx_audit_logs_entity_id ON audit_logs(entity_id);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp);

-- =============================================
-- DEPARTMENTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS departments (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  head_doctor_id INTEGER REFERENCES doctors(id) ON DELETE SET NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'Active',
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  deleted_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_departments_name ON departments(name);
CREATE INDEX idx_departments_status ON departments(status);
CREATE INDEX idx_departments_head ON departments(head_doctor_id);

-- =============================================
-- BEDS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS beds (
  id SERIAL PRIMARY KEY,
  bed_number VARCHAR(20) UNIQUE NOT NULL,
  ward_type VARCHAR(50) NOT NULL,
  department_id INTEGER REFERENCES departments(id) ON DELETE SET NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'Available',
  price_per_day DECIMAL(10,2) NOT NULL DEFAULT 0,
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  deleted_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_beds_number ON beds(bed_number);
CREATE INDEX idx_beds_ward ON beds(ward_type);
CREATE INDEX idx_beds_department ON beds(department_id);
CREATE INDEX idx_beds_status ON beds(status);

-- =============================================
-- ADMISSIONS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS admissions (
  id SERIAL PRIMARY KEY,
  admission_code VARCHAR(20) UNIQUE NOT NULL,
  patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE RESTRICT,
  bed_id INTEGER REFERENCES beds(id) ON DELETE SET NULL,
  doctor_id INTEGER REFERENCES doctors(id) ON DELETE SET NULL,
  admission_date TIMESTAMP NOT NULL DEFAULT NOW(),
  discharge_date TIMESTAMP,
  reason TEXT NOT NULL,
  diagnosis TEXT,
  treatment_plan TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'Admitted',
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  deleted_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_admissions_code ON admissions(admission_code);
CREATE INDEX idx_admissions_patient ON admissions(patient_id);
CREATE INDEX idx_admissions_bed ON admissions(bed_id);
CREATE INDEX idx_admissions_doctor ON admissions(doctor_id);
CREATE INDEX idx_admissions_date ON admissions(admission_date);
CREATE INDEX idx_admissions_status ON admissions(status);
CREATE INDEX idx_admissions_discharge ON admissions(discharge_date);

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

CREATE INDEX idx_staff_code ON staff(employee_code);
CREATE INDEX idx_staff_user ON staff(user_id);
CREATE INDEX idx_staff_department ON staff(department_id);
CREATE INDEX idx_staff_status ON staff(status);
CREATE INDEX idx_staff_position ON staff(position);

-- =============================================
-- INSERT SAMPLE DATA
-- =============================================
INSERT INTO departments (name, description, status) VALUES
  ('Cardiology', 'Heart and cardiovascular system', 'Active'),
  ('Neurology', 'Brain and nervous system', 'Active'),
  ('Orthopedics', 'Bones and joints', 'Active'),
  ('Pediatrics', 'Child healthcare', 'Active'),
  ('General Medicine', 'General health conditions', 'Active'),
  ('Emergency', 'Emergency care unit', 'Active'),
  ('ICU', 'Intensive Care Unit', 'Active'),
  ('Surgery', 'Surgical procedures', 'Active')
ON CONFLICT DO NOTHING;

INSERT INTO beds (bed_number, ward_type, status, price_per_day) VALUES
  ('ICU-101', 'ICU', 'Available', 5000.00),
  ('ICU-102', 'ICU', 'Available', 5000.00),
  ('ICU-103', 'ICU', 'Available', 5000.00),
  ('GEN-101', 'General', 'Available', 1500.00),
  ('GEN-102', 'General', 'Available', 1500.00),
  ('GEN-103', 'General', 'Available', 1500.00),
  ('GEN-104', 'General', 'Available', 1500.00),
  ('GEN-105', 'General', 'Available', 1500.00),
  ('PRV-101', 'Private', 'Available', 3000.00),
  ('PRV-102', 'Private', 'Available', 3000.00),
  ('PRV-103', 'Private', 'Available', 3000.00),
  ('WARD-A1', 'Ward A', 'Available', 1000.00),
  ('WARD-A2', 'Ward A', 'Available', 1000.00),
  ('WARD-A3', 'Ward A', 'Available', 1000.00),
  ('WARD-B1', 'Ward B', 'Available', 1200.00),
  ('WARD-B2', 'Ward B', 'Available', 1200.00),
  ('WARD-B3', 'Ward B', 'Available', 1200.00)
ON CONFLICT (bed_number) DO NOTHING;

-- =============================================
-- HELPER FUNCTION
-- =============================================
CREATE OR REPLACE FUNCTION update_bed_on_admission()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.bed_id IS NOT NULL THEN
    UPDATE beds SET status = 'Occupied' WHERE id = NEW.bed_id;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.bed_id IS DISTINCT FROM NEW.bed_id THEN
      IF OLD.bed_id IS NOT NULL THEN
        UPDATE beds SET status = 'Available' WHERE id = OLD.bed_id;
      END IF;
      IF NEW.bed_id IS NOT NULL THEN
        UPDATE beds SET status = 'Occupied' WHERE id = NEW.bed_id;
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS admission_bed_trigger ON admissions;
CREATE TRIGGER admission_bed_trigger
AFTER INSERT OR UPDATE ON admissions
FOR EACH ROW EXECUTE FUNCTION update_bed_on_admission();
