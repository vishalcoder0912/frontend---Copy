INSERT INTO patients (name, age, gender, blood_type, phone, email, address, medical_history, status)
VALUES
('Aarav Mehta', 34, 'Male', 'O+', '+91 98765 12001', 'aarav@example.com', 'Mumbai', 'Hypertension', 'Active'),
('Ishita Rao', 28, 'Female', 'A+', '+91 98765 12002', 'ishita@example.com', 'Pune', 'Asthma', 'Active'),
('Rohan Verma', 41, 'Male', 'B+', '+91 98765 12003', 'rohan@example.com', 'Delhi', 'Diabetes', 'Critical');

INSERT INTO doctors (name, specialization, experience, phone, email, availability, rating)
VALUES
('Dr. Kavya Rao', 'Cardiology', 12, '+91 98888 11111', 'kavya@example.com', 'Available', 4.8),
('Dr. Amit Kulkarni', 'Neurology', 15, '+91 98888 22222', 'amit@example.com', 'In Surgery', 4.7),
('Dr. Sana Mirza', 'Pediatrics', 8, '+91 98888 33333', 'sana@example.com', 'Available', 4.9);

INSERT INTO appointments (patient_id, doctor_id, appointment_date, type, status, notes)
VALUES
(1, 1, '2026-03-22 09:30:00', 'Follow-up', 'Scheduled', 'Routine check'),
(2, 3, '2026-03-22 10:15:00', 'Pediatric Check', 'Scheduled', 'Vaccination review'),
(3, 2, '2026-03-21 14:00:00', 'Neurology Consult', 'Completed', 'MRI review');

INSERT INTO billing (patient_id, doctor_id, appointment_id, amount, status, invoice_date, due_date)
VALUES
(1, 1, 1, 8200.00, 'Paid', '2026-03-18', '2026-04-01'),
(2, 3, 2, 4200.00, 'Pending', '2026-03-17', '2026-04-02'),
(3, 2, 3, 15400.00, 'Overdue', '2026-03-10', '2026-03-25');

INSERT INTO users (name, email, password_hash, role)
VALUES
('Admin User', 'admin@medicare.com', '$2a$10$UoQ2wDq8hS9dNRKqvP2uOeP7Xk8S9n1u0B4z5vX4n8tJYz0Xn5r2G', 'admin');
