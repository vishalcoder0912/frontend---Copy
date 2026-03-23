-- Users
INSERT INTO users (name, email, password_hash, role) VALUES
('Admin User', 'admin@medicare.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lHHi', 'admin'),
('Staff User', 'staff@medicare.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lHHi', 'staff');

-- Patients
INSERT INTO patients (
  name, age, gender, blood_type, phone, email, address, medical_history, status
) VALUES
('Aarav Sharma', 32, 'Male', 'O+', '+91-9811111111', 'aarav.sharma@example.com', 'Delhi, India', 'Hypertension', 'Active'),
('Diya Verma', 27, 'Female', 'A+', '+91-9822222222', 'diya.verma@example.com', 'Mumbai, India', 'Asthma', 'Active'),
('Rohan Iyer', 45, 'Male', 'B+', '+91-9833333333', 'rohan.iyer@example.com', 'Bengaluru, India', 'Diabetes', 'Active'),
('Kavya Nair', 39, 'Female', 'AB+', '+91-9844444444', 'kavya.nair@example.com', 'Kochi, India', 'Migraine', 'Active'),
('Vikram Singh', 52, 'Male', 'O-', '+91-9855555555', 'vikram.singh@example.com', 'Jaipur, India', 'Cardiac issues', 'Active');

-- Doctors
INSERT INTO doctors (
  name, specialization, qualification, experience, phone, email,
  availability, rating, status, working_hours
) VALUES
('Dr. Ananya Rao', 'Cardiology', 'MD, DM Cardiology', 12, '+91-9900011111', 'ananya.rao@medicare.com',
 'Available', 4.7, 'Active', '{"mon":"09:00-17:00","tue":"09:00-17:00"}'),
('Dr. Kunal Mehta', 'Neurology', 'MD, DM Neurology', 9, '+91-9900022222', 'kunal.mehta@medicare.com',
 'In Surgery', 4.5, 'Active', '{"mon":"10:00-18:00","wed":"10:00-18:00"}'),
('Dr. Sana Khan', 'Pediatrics', 'MD Pediatrics', 8, '+91-9900033333', 'sana.khan@medicare.com',
 'Available', 4.6, 'Active', '{"tue":"09:00-16:00","thu":"09:00-16:00"}');

-- Appointments
INSERT INTO appointments (
  patient_id, doctor_id, appointment_date, duration, type, status, notes
) VALUES
(1, 1, NOW() + INTERVAL '1 day', 30, 'Consultation', 'Scheduled', 'Initial cardiology consult'),
(2, 3, NOW() + INTERVAL '2 days', 30, 'Routine Check', 'Scheduled', 'Pediatric follow-up'),
(3, 2, NOW() - INTERVAL '1 day', 45, 'Diagnostic', 'Completed', 'Neurology assessment');

-- Billing
INSERT INTO billing (
  patient_id, doctor_id, appointment_id, amount, discount, tax, total,
  status, payment_method, invoice_date, due_date, notes
) VALUES
(1, 1, 1, 2500.00, 200.00, 90.00, 2390.00, 'Pending', 'Card', NOW(), NOW() + INTERVAL '7 days', 'Cardiology consultation'),
(2, 3, 2, 1500.00, 0.00, 60.00, 1560.00, 'Paid', 'Cash', NOW() - INTERVAL '1 day', NOW() + INTERVAL '5 days', 'Pediatric routine check'),
(3, 2, 3, 3200.00, 300.00, 120.00, 3020.00, 'Overdue', 'UPI', NOW() - INTERVAL '10 days', NOW() - INTERVAL '2 days', 'Neurology diagnostic');
