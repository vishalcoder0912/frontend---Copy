-- Migration script for Beds, Departments, and Admissions tables
-- Run this script to ensure all tables exist with proper structure

-- =============================================
-- DEPARTMENTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS departments (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  head_doctor_id INTEGER REFERENCES doctors(id) ON DELETE SET NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'Active',
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  deleted_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_departments_name ON departments(name);
CREATE INDEX IF NOT EXISTS idx_departments_status ON departments(status);

-- =============================================
-- BEDS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS beds (
  id SERIAL PRIMARY KEY,
  bed_number VARCHAR(20) NOT NULL UNIQUE,
  ward_type VARCHAR(50) NOT NULL,
  department_id INTEGER REFERENCES departments(id) ON DELETE SET NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'Available',
  price_per_day DECIMAL(10,2) NOT NULL DEFAULT 0,
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  deleted_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_beds_number ON beds(bed_number);
CREATE INDEX IF NOT EXISTS idx_beds_ward ON beds(ward_type);
CREATE INDEX IF NOT EXISTS idx_beds_department ON beds(department_id);
CREATE INDEX IF NOT EXISTS idx_beds_status ON beds(status);

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

CREATE INDEX IF NOT EXISTS idx_admissions_code ON admissions(admission_code);
CREATE INDEX IF NOT EXISTS idx_admissions_patient ON admissions(patient_id);
CREATE INDEX IF NOT EXISTS idx_admissions_bed ON admissions(bed_id);
CREATE INDEX IF NOT EXISTS idx_admissions_doctor ON admissions(doctor_id);
CREATE INDEX IF NOT EXISTS idx_admissions_date ON admissions(admission_date);
CREATE INDEX IF NOT EXISTS idx_admissions_status ON admissions(status);
CREATE INDEX IF NOT EXISTS idx_admissions_discharge ON admissions(discharge_date);

-- =============================================
-- INSERT SAMPLE DATA
-- =============================================

-- Insert departments (ignore if exists)
INSERT INTO departments (name, description, status) VALUES
  ('General Medicine', 'General health conditions and treatments', 'Active'),
  ('Cardiology', 'Heart and cardiovascular system care', 'Active'),
  ('Neurology', 'Brain and nervous system', 'Active'),
  ('Orthopedics', 'Bones, joints, and muscles', 'Active'),
  ('Pediatrics', 'Child healthcare from birth to adolescence', 'Active'),
  ('Emergency', 'Emergency and trauma care', 'Active'),
  ('ICU', 'Intensive Care Unit', 'Active'),
  ('Surgery', 'Surgical procedures and post-operative care', 'Active')
ON CONFLICT (name) DO NOTHING;

-- Insert beds (ignore if exists)
INSERT INTO beds (bed_number, ward_type, status, price_per_day) VALUES
  ('ICU-101', 'ICU', 'Available', 5000.00),
  ('ICU-102', 'ICU', 'Available', 5000.00),
  ('ICU-103', 'ICU', 'Occupied', 5000.00),
  ('GEN-101', 'General', 'Available', 1500.00),
  ('GEN-102', 'General', 'Available', 1500.00),
  ('GEN-103', 'General', 'Available', 1500.00),
  ('GEN-104', 'General', 'Occupied', 1500.00),
  ('GEN-105', 'General', 'Available', 1500.00),
  ('PRV-101', 'Private', 'Available', 3000.00),
  ('PRV-102', 'Private', 'Available', 3000.00),
  ('PRV-103', 'Private', 'Occupied', 3000.00),
  ('WARD-A1', 'Ward A', 'Available', 1000.00),
  ('WARD-A2', 'Ward A', 'Available', 1000.00),
  ('WARD-A3', 'Ward A', 'Available', 1000.00),
  ('WARD-B1', 'Ward B', 'Available', 1200.00),
  ('WARD-B2', 'Ward B', 'Occupied', 1200.00),
  ('WARD-B3', 'Ward B', 'Available', 1200.00),
  ('PED-101', 'Pediatric', 'Available', 2000.00),
  ('PED-102', 'Pediatric', 'Available', 2000.00),
  ('ER-101', 'Emergency', 'Available', 2500.00)
ON CONFLICT (bed_number) DO NOTHING;

-- =============================================
-- HELPER FUNCTION FOR BED STATUS
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
    -- Handle discharge
    IF TG_OP = 'UPDATE' AND NEW.status = 'Discharged' AND OLD.status = 'Admitted' THEN
      IF NEW.bed_id IS NOT NULL THEN
        UPDATE beds SET status = 'Available' WHERE id = NEW.bed_id;
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger and recreate
DROP TRIGGER IF EXISTS admission_bed_trigger ON admissions;
CREATE TRIGGER admission_bed_trigger
AFTER INSERT OR UPDATE ON admissions
FOR EACH ROW EXECUTE FUNCTION update_bed_on_admission();

-- =============================================
-- VERIFICATION QUERIES
-- =============================================
-- SELECT 'Departments: ' || COUNT(*) FROM departments;
-- SELECT 'Beds: ' || COUNT(*) FROM beds;
-- SELECT 'Admissions: ' || COUNT(*) FROM admissions;
