-- Medicare HMS - Admissions, Beds, Departments Schema Migration
-- Run this AFTER schema.sql

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
-- INSERT SAMPLE DATA
-- =============================================

-- Insert sample departments
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

-- Insert sample beds (for each ward type)
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
  ('WARD-B3', 'Ward B', 'Available', 1200.00),
  ('WARD-C1', 'Ward C', 'Available', 800.00),
  ('WARD-C2', 'Ward C', 'Available', 800.00),
  ('WARD-C3', 'Ward C', 'Available', 800.00)
ON CONFLICT (bed_number) DO NOTHING;

-- =============================================
-- HELPER FUNCTIONS
-- =============================================

-- Function to get next admission code
CREATE OR REPLACE FUNCTION generate_admission_code()
RETURNS VARCHAR(20) AS $$
DECLARE
  next_num INTEGER;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(admission_code FROM 4) AS INTEGER)), 999) + 1
  INTO next_num
  FROM admissions;
  RETURN 'ADM' || LPAD(next_num::TEXT, 5, '0');
END;
$$ LANGUAGE plpgsql;

-- Function to update bed status when admission changes
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

-- Trigger to auto-update bed status
DROP TRIGGER IF EXISTS admission_bed_trigger ON admissions;
CREATE TRIGGER admission_bed_trigger
AFTER INSERT OR UPDATE ON admissions
FOR EACH ROW EXECUTE FUNCTION update_bed_on_admission();

-- =============================================
-- VIEWS FOR COMMON QUERIES
-- =============================================

-- Active admissions view
CREATE OR REPLACE VIEW v_active_admissions AS
SELECT 
  a.id,
  a.admission_code,
  a.admission_date,
  a.reason,
  a.diagnosis,
  a.status,
  p.name AS patient_name,
  p.patient_code,
  p.phone AS patient_phone,
  d.name AS doctor_name,
  b.bed_number,
  b.ward_type,
  EXTRACT(DAYS FROM (NOW() - a.admission_date)) AS days_admitted
FROM admissions a
LEFT JOIN patients p ON a.patient_id = p.id
LEFT JOIN doctors d ON a.doctor_id = d.id
LEFT JOIN beds b ON a.bed_id = b.id
WHERE a.is_deleted = false AND a.status = 'Admitted'
ORDER BY a.admission_date DESC;

-- Bed availability view
CREATE OR REPLACE VIEW v_bed_availability AS
SELECT 
  b.id,
  b.bed_number,
  b.ward_type,
  b.status,
  b.price_per_day,
  d.name AS department_name,
  COUNT(a.id) OVER (PARTITION BY b.ward_type) AS ward_total,
  SUM(CASE WHEN b.status = 'Available' THEN 1 ELSE 0 END) OVER (PARTITION BY b.ward_type) AS ward_available
FROM beds b
LEFT JOIN departments d ON b.department_id = d.id
WHERE b.is_deleted = false;
