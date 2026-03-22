INSERT INTO users (name, email, password_hash, role, is_active)
VALUES
('Admin User', 'admin@medicare.com', '$2a$10$3nVQY36tP1c9l6bYJpD3weZq8W2eG4qz4n3xT9cG9JrKJmWcYc7xy', 'admin', true),
('Staff User', 'staff@medicare.com', '$2a$10$3nVQY36tP1c9l6bYJpD3weZq8W2eG4qz4n3xT9cG9JrKJmWcYc7xy', 'staff', true);

INSERT INTO patients (patient_id, name, age, dob, gender, blood_type, phone, email, address, emergency_contact, emergency_phone, medical_history, allergies, status, created_by)
VALUES
('PAT-001', 'Aarav Mehta', 34, '1992-03-12', 'Male', 'O+', '+91 98765 12001', 'aarav@example.com', 'Mumbai', 'Riya Mehta', '+91 98765 12011', 'Hypertension', 'None', 'Active', 1),
('PAT-002', 'Ishita Rao', 28, '1996-07-22', 'Female', 'A+', '+91 98765 12002', 'ishita@example.com', 'Pune', 'Rohan Rao', '+91 98765 12012', 'Asthma', 'Dust', 'Active', 1),
('PAT-003', 'Rohan Verma', 41, '1984-02-05', 'Male', 'B+', '+91 98765 12003', 'rohan@example.com', 'Delhi', 'Meera Verma', '+91 98765 12013', 'Diabetes', 'Peanuts', 'Active', 2);

INSERT INTO doctors (doctor_id, name, specialization, qualification, experience, phone, email, availability, rating, status)
VALUES
('DOC-001', 'Dr. Kavya Rao', 'Cardiology', 'MBBS, MD', 12, '+91 98888 11111', 'kavya@example.com', 'Available', 4.8, 'Active'),
('DOC-002', 'Dr. Amit Kulkarni', 'Neurology', 'MBBS, DM', 15, '+91 98888 22222', 'amit@example.com', 'In Surgery', 4.7, 'Active'),
('DOC-003', 'Dr. Sana Mirza', 'Pediatrics', 'MBBS, MD', 8, '+91 98888 33333', 'sana@example.com', 'Available', 4.9, 'Active');

INSERT INTO appointments (appointment_id, patient_id, doctor_id, appointment_date, duration, type, status, notes, created_by)
VALUES
('APT-001', 1, 1, '2026-03-22 09:30:00', 30, 'Follow-up', 'Scheduled', 'Routine check', 1),
('APT-002', 2, 3, '2026-03-22 10:15:00', 30, 'Pediatric Check', 'Scheduled', 'Vaccination review', 1),
('APT-003', 3, 2, '2026-03-21 14:00:00', 45, 'Neurology Consult', 'Completed', 'MRI review', 2);

INSERT INTO billing (invoice_id, patient_id, doctor_id, appointment_id, amount, discount, tax, total, status, payment_method, invoice_date, due_date, notes, created_by)
VALUES
('INV-001', 1, 1, 1, 8200.00, 0, 0, 8200.00, 'Paid', 'Card', '2026-03-18', '2026-04-01', 'Paid in full', 1),
('INV-002', 2, 3, 2, 4200.00, 0, 0, 4200.00, 'Pending', 'Cash', '2026-03-17', '2026-04-02', 'Awaiting payment', 1),
('INV-003', 3, 2, 3, 15400.00, 500.00, 0, 14900.00, 'Overdue', 'UPI', '2026-03-10', '2026-03-25', 'Overdue invoice', 2);

INSERT INTO notifications (user_id, title, message, type, entity_type, entity_id)
VALUES
(1, 'Welcome', 'Welcome to Medicare HMS!', 'system', 'user', 1),
(2, 'Reminder', 'Complete today\'s appointments.', 'alert', 'appointment', 1);
