INSERT INTO users (name, email, password_hash, role, status) VALUES
('Admin User', 'admin@medicare.com', '$2a$10$.PybKmrskfLh64z2Qfl1/eq.Z/WqFWBrdnlFIoiGVOOMa9wR9LcQW', 'admin', 'Active'),
('Staff User', 'staff@medicare.com', '$2a$10$.PybKmrskfLh64z2Qfl1/eq.Z/WqFWBrdnlFIoiGVOOMa9wR9LcQW', 'staff', 'Active'),
('Doctor User', 'doctor@medicare.com', '$2a$10$.PybKmrskfLh64z2Qfl1/eq.Z/WqFWBrdnlFIoiGVOOMa9wR9LcQW', 'doctor', 'Active'),
('Nurse User', 'nurse@medicare.com', '$2a$10$.PybKmrskfLh64z2Qfl1/eq.Z/WqFWBrdnlFIoiGVOOMa9wR9LcQW', 'nurse', 'Active'),
('Receptionist User', 'receptionist@medicare.com', '$2a$10$.PybKmrskfLh64z2Qfl1/eq.Z/WqFWBrdnlFIoiGVOOMa9wR9LcQW', 'receptionist', 'Active'),
('Billing User', 'billing@medicare.com', '$2a$10$.PybKmrskfLh64z2Qfl1/eq.Z/WqFWBrdnlFIoiGVOOMa9wR9LcQW', 'billing', 'Active'),
('Lab Technician User', 'labtech@medicare.com', '$2a$10$.PybKmrskfLh64z2Qfl1/eq.Z/WqFWBrdnlFIoiGVOOMa9wR9LcQW', 'lab_technician', 'Active'),
('Pharmacist User', 'pharmacist@medicare.com', '$2a$10$.PybKmrskfLh64z2Qfl1/eq.Z/WqFWBrdnlFIoiGVOOMa9wR9LcQW', 'pharmacist', 'Active'),
('Patient User', 'patient@medicare.com', '$2a$10$.PybKmrskfLh64z2Qfl1/eq.Z/WqFWBrdnlFIoiGVOOMa9wR9LcQW', 'patient', 'Active');

INSERT INTO patients (
  patient_code, name, age, gender, blood_type, phone, email, address, medical_history, last_visit, status
) VALUES
('P-1001', 'Aarav Mehta', 34, 'Male', 'O+', '+91 98765 12001', 'aarav.mehta@medicare.com', 'Mumbai, Maharashtra', 'Hypertension monitoring', '2026-03-18', 'Active'),
('P-1002', 'Ishita Rao', 28, 'Female', 'A+', '+91 98765 12002', 'ishita.rao@medicare.com', 'Pune, Maharashtra', 'Seasonal allergies', '2026-03-16', 'Active'),
('P-1003', 'Rohan Verma', 41, 'Male', 'B+', '+91 98765 12003', 'rohan.verma@medicare.com', 'Delhi, NCR', 'Migraine and neuro follow-up', '2026-03-10', 'Critical'),
('P-1004', 'Ananya Gupta', 52, 'Female', 'AB+', '+91 98765 12004', 'ananya.gupta@medicare.com', 'Noida, Uttar Pradesh', 'Knee pain treatment', '2026-03-12', 'Active'),
('P-1005', 'Kiran Iyer', 45, 'Male', 'O-', '+91 98765 12005', 'kiran.iyer@medicare.com', 'Chennai, Tamil Nadu', 'General medicine follow-up', '2026-02-28', 'Discharged'),
('P-1006', 'Meera Nair', 37, 'Female', 'A-', '+91 98765 12006', 'meera.nair@medicare.com', 'Kochi, Kerala', 'Dermatology treatment plan', '2026-03-08', 'Active'),
('P-1007', 'Vikram Singh', 63, 'Male', 'B-', '+91 98765 12007', 'vikram.singh@medicare.com', 'Jaipur, Rajasthan', 'Oncology care in progress', '2026-03-01', 'Critical'),
('P-1008', 'Sara Khan', 31, 'Female', 'O+', '+91 98765 12008', 'sara.khan@medicare.com', 'Bhopal, Madhya Pradesh', 'Routine gynecology review', '2026-03-20', 'Active'),
('P-1009', 'Dev Patel', 26, 'Male', 'A+', '+91 98765 12009', 'dev.patel@medicare.com', 'Ahmedabad, Gujarat', 'ENT consultation history', '2026-03-19', 'Active'),
('P-1010', 'Priya Das', 58, 'Female', 'AB-', '+91 98765 12010', 'priya.das@medicare.com', 'Kolkata, West Bengal', 'Cardiology review completed', '2026-03-05', 'Discharged'),
('P-1011', 'Rahul Menon', 39, 'Male', 'O+', '+91 98765 12011', 'rahul.menon@medicare.com', 'Thiruvananthapuram, Kerala', 'Physiotherapy follow-up', '2026-03-15', 'Active'),
('P-1012', 'Neha Sharma', 33, 'Female', 'B+', '+91 98765 12012', 'neha.sharma@medicare.com', 'Chandigarh', 'Pediatric family check support', '2026-03-13', 'Active'),
('P-1013', 'Sahil Roy', 47, 'Male', 'A+', '+91 98765 12013', 'sahil.roy@medicare.com', 'Kolkata, West Bengal', 'Neurology diagnostics', '2026-03-07', 'Critical'),
('P-1014', 'Tanya Bose', 29, 'Female', 'O+', '+91 98765 12014', 'tanya.bose@medicare.com', 'Kolkata, West Bengal', 'Dermatology review', '2026-03-11', 'Active'),
('P-1015', 'Arjun Pillai', 54, 'Male', 'B-', '+91 98765 12015', 'arjun.pillai@medicare.com', 'Kochi, Kerala', 'General medicine discharge case', '2026-03-02', 'Discharged'),
('P-1016', 'Zoya Kapoor', 30, 'Female', 'A+', '+91 98765 12016', 'zoya.kapoor@medicare.com', 'Delhi, NCR', 'Prenatal care', '2026-03-21', 'Active'),
('P-1017', 'Harsh Malhotra', 44, 'Male', 'O+', '+91 98765 12017', 'harsh.malhotra@medicare.com', 'Gurugram, Haryana', 'Cardiology follow-up', '2026-03-22', 'Active'),
('P-1018', 'Manisha Singh', 36, 'Female', 'B+', '+91 98765 12018', 'manisha.singh@medicare.com', 'Lucknow, Uttar Pradesh', 'ENT review', '2026-03-18', 'Active'),
('P-1019', 'Kabir Shah', 49, 'Male', 'AB+', '+91 98765 12019', 'kabir.shah@medicare.com', 'Surat, Gujarat', 'Oncology checkup', '2026-03-19', 'Critical'),
('P-1020', 'Sneha Joshi', 32, 'Female', 'O-', '+91 98765 12020', 'sneha.joshi@medicare.com', 'Pune, Maharashtra', 'Therapy sessions ongoing', '2026-03-20', 'Active');

INSERT INTO doctors (
  doctor_code, name, specialization, qualification, experience, phone, email, availability, rating, bio, status, working_hours
) VALUES
('D-2001', 'Dr. Kavya Rao', 'Cardiology', 'MD, DM Cardiology', 12, '+91 98100 22001', 'kavya.rao@medicare.com', 'Available', 4.8, 'Senior cardiologist focused on preventive cardiac care.', 'Active', '{"mon":"09:00-17:00","wed":"09:00-17:00","fri":"09:00-15:00"}'),
('D-2002', 'Dr. Amit Kulkarni', 'Neurology', 'MD, DM Neurology', 15, '+91 98100 22002', 'amit.kulkarni@medicare.com', 'In Surgery', 4.7, 'Handles complex neurology diagnostics and follow-ups.', 'Active', '{"mon":"10:00-18:00","thu":"10:00-18:00"}'),
('D-2003', 'Dr. Mehul Jain', 'Orthopedics', 'MS Orthopedics', 9, '+91 98100 22003', 'mehul.jain@medicare.com', 'Available', 4.5, 'Orthopedic specialist for post-op and review care.', 'Active', '{"tue":"09:00-17:00","sat":"09:00-13:00"}'),
('D-2004', 'Dr. Sana Mirza', 'Pediatrics', 'MD Pediatrics', 8, '+91 98100 22004', 'sana.mirza@medicare.com', 'Available', 4.9, 'Pediatrician with strong preventive care focus.', 'Active', '{"mon":"09:00-16:00","wed":"09:00-16:00","fri":"09:00-16:00"}'),
('D-2005', 'Dr. Vijay Khanna', 'General Medicine', 'MD General Medicine', 18, '+91 98100 22005', 'vijay.khanna@medicare.com', 'On Leave', 4.6, 'Senior physician for general medicine and chronic care.', 'Active', '{"tue":"10:00-17:00","thu":"10:00-17:00"}'),
('D-2006', 'Dr. Nisha Agarwal', 'Dermatology', 'MD Dermatology', 11, '+91 98100 22006', 'nisha.agarwal@medicare.com', 'Available', 4.4, 'Dermatology specialist for long-term skin treatment plans.', 'Active', '{"mon":"11:00-18:00","thu":"11:00-18:00"}'),
('D-2007', 'Dr. Yash Patel', 'Oncology', 'DM Oncology', 14, '+91 98100 22007', 'yash.patel@medicare.com', 'In Surgery', 4.7, 'Oncology consultant for active cancer care and reviews.', 'Active', '{"wed":"09:00-17:00","fri":"09:00-17:00"}'),
('D-2008', 'Dr. Leena Iyer', 'Gynecology', 'MS Obstetrics & Gynecology', 10, '+91 98100 22008', 'leena.iyer@medicare.com', 'Available', 4.8, 'Gynecology and prenatal care specialist.', 'Active', '{"mon":"09:00-17:00","thu":"09:00-17:00"}'),
('D-2009', 'Dr. Rahul Sen', 'ENT', 'MS ENT', 7, '+91 98100 22009', 'rahul.sen@medicare.com', 'Available', 4.3, 'ENT specialist handling consults and follow-up reviews.', 'Active', '{"tue":"09:00-17:00","fri":"09:00-17:00"}'),
('D-2010', 'Dr. Farah Khan', 'Psychiatry', 'MD Psychiatry', 13, '+91 98100 22010', 'farah.khan@medicare.com', 'On Leave', 4.6, 'Psychiatry consultant for therapy and behavioral care.', 'Active', '{"wed":"10:00-18:00","sat":"10:00-14:00"}');

INSERT INTO appointments (
  appointment_code, patient_id, doctor_id, appointment_date, duration, type, status, notes, symptoms, prescription, follow_up_date
) VALUES
('A-3001', (SELECT id FROM patients WHERE patient_code = 'P-1001'), (SELECT id FROM doctors WHERE doctor_code = 'D-2001'), '2026-03-22 09:30:00', 30, 'Follow-up', 'Scheduled', 'Cardiology follow-up booked from dashboard.', 'Blood pressure review', NULL, NULL),
('A-3002', (SELECT id FROM patients WHERE patient_code = 'P-1002'), (SELECT id FROM doctors WHERE doctor_code = 'D-2004'), '2026-03-22 10:15:00', 30, 'Pediatric Check', 'Scheduled', 'Routine pediatric check appointment.', 'Routine check', NULL, NULL),
('A-3003', (SELECT id FROM patients WHERE patient_code = 'P-1003'), (SELECT id FROM doctors WHERE doctor_code = 'D-2002'), '2026-03-21 14:00:00', 45, 'Neurology Consult', 'Completed', 'Diagnostic review completed.', 'Headache and dizziness', 'Continue medication', '2026-04-04'),
('A-3004', (SELECT id FROM patients WHERE patient_code = 'P-1004'), (SELECT id FROM doctors WHERE doctor_code = 'D-2003'), '2026-03-23 11:00:00', 30, 'Orthopedic Review', 'Scheduled', 'Post-treatment orthopedic review.', 'Joint stiffness', NULL, NULL),
('A-3005', (SELECT id FROM patients WHERE patient_code = 'P-1005'), (SELECT id FROM doctors WHERE doctor_code = 'D-2005'), '2026-03-20 15:30:00', 30, 'General Consultation', 'Completed', 'General consultation completed.', 'Fatigue', 'Rest and hydration', NULL),
('A-3006', (SELECT id FROM patients WHERE patient_code = 'P-1006'), (SELECT id FROM doctors WHERE doctor_code = 'D-2006'), '2026-03-24 12:45:00', 30, 'Skin Evaluation', 'Scheduled', 'Follow-up skin assessment.', 'Skin rash', NULL, NULL),
('A-3007', (SELECT id FROM patients WHERE patient_code = 'P-1007'), (SELECT id FROM doctors WHERE doctor_code = 'D-2007'), '2026-03-21 09:00:00', 45, 'Oncology Follow-up', 'Completed', 'Follow-up completed.', 'Treatment review', 'Continue cycle', '2026-03-31'),
('A-3008', (SELECT id FROM patients WHERE patient_code = 'P-1008'), (SELECT id FROM doctors WHERE doctor_code = 'D-2008'), '2026-03-25 10:00:00', 30, 'Gynecology Check', 'Scheduled', 'Routine gynecology check.', 'Routine review', NULL, NULL),
('A-3009', (SELECT id FROM patients WHERE patient_code = 'P-1009'), (SELECT id FROM doctors WHERE doctor_code = 'D-2009'), '2026-03-22 13:15:00', 30, 'ENT Consultation', 'Scheduled', 'ENT consult booked.', 'Ear pain', NULL, NULL),
('A-3010', (SELECT id FROM patients WHERE patient_code = 'P-1010'), (SELECT id FROM doctors WHERE doctor_code = 'D-2001'), '2026-03-19 16:00:00', 30, 'Cardiology Review', 'Cancelled', 'Patient postponed review.', 'Routine review', NULL, NULL),
('A-3011', (SELECT id FROM patients WHERE patient_code = 'P-1011'), (SELECT id FROM doctors WHERE doctor_code = 'D-2003'), '2026-03-24 09:45:00', 30, 'Physio Follow-up', 'Scheduled', 'Physio follow-up booked.', 'Back pain', NULL, NULL),
('A-3012', (SELECT id FROM patients WHERE patient_code = 'P-1012'), (SELECT id FROM doctors WHERE doctor_code = 'D-2004'), '2026-03-23 14:20:00', 30, 'Pediatric Check', 'Scheduled', 'Family pediatric review.', 'Routine review', NULL, NULL),
('A-3013', (SELECT id FROM patients WHERE patient_code = 'P-1013'), (SELECT id FROM doctors WHERE doctor_code = 'D-2002'), '2026-03-20 11:30:00', 45, 'Neuro Diagnostic', 'Completed', 'Neurology diagnostics completed.', 'Recurring migraine', 'Scan review pending', '2026-03-30'),
('A-3014', (SELECT id FROM patients WHERE patient_code = 'P-1014'), (SELECT id FROM doctors WHERE doctor_code = 'D-2006'), '2026-03-25 15:00:00', 30, 'Dermatology Review', 'Scheduled', 'Review of ongoing skin treatment.', 'Skin irritation', NULL, NULL),
('A-3015', (SELECT id FROM patients WHERE patient_code = 'P-1015'), (SELECT id FROM doctors WHERE doctor_code = 'D-2005'), '2026-03-21 12:00:00', 30, 'General Check', 'Completed', 'General review completed.', 'Routine review', 'Continue vitamins', NULL),
('A-3016', (SELECT id FROM patients WHERE patient_code = 'P-1016'), (SELECT id FROM doctors WHERE doctor_code = 'D-2008'), '2026-03-26 10:30:00', 30, 'Prenatal', 'Scheduled', 'Prenatal visit booked.', 'Prenatal consultation', NULL, NULL),
('A-3017', (SELECT id FROM patients WHERE patient_code = 'P-1017'), (SELECT id FROM doctors WHERE doctor_code = 'D-2001'), '2026-03-24 17:15:00', 30, 'Cardiology Follow-up', 'Scheduled', 'Follow-up review after prior consultation.', 'Chest discomfort follow-up', NULL, NULL),
('A-3018', (SELECT id FROM patients WHERE patient_code = 'P-1018'), (SELECT id FROM doctors WHERE doctor_code = 'D-2009'), '2026-03-23 09:20:00', 30, 'ENT Review', 'Scheduled', 'ENT review appointment.', 'Sinus review', NULL, NULL),
('A-3019', (SELECT id FROM patients WHERE patient_code = 'P-1019'), (SELECT id FROM doctors WHERE doctor_code = 'D-2007'), '2026-03-19 11:00:00', 45, 'Oncology Check', 'Cancelled', 'Appointment cancelled by clinic.', 'Treatment check', NULL, NULL),
('A-3020', (SELECT id FROM patients WHERE patient_code = 'P-1020'), (SELECT id FROM doctors WHERE doctor_code = 'D-2010'), '2026-03-25 16:30:00', 60, 'Therapy Session', 'Scheduled', 'Therapy session reserved.', 'Behavioral therapy', NULL, NULL);

INSERT INTO billing (
  invoice_id, patient_id, doctor_id, appointment_id, amount, discount, tax, total, status, payment_method, invoice_date, due_date, paid_at, notes
) VALUES
('B-4001', (SELECT id FROM patients WHERE patient_code = 'P-1001'), (SELECT id FROM doctors WHERE doctor_code = 'D-2001'), (SELECT id FROM appointments WHERE appointment_code = 'A-3001'), 8200, 0, 0, 8200, 'Paid', 'Card', '2026-03-18', '2026-03-25', '2026-03-18 14:00:00', 'Cardiology billing record'),
('B-4002', (SELECT id FROM patients WHERE patient_code = 'P-1002'), (SELECT id FROM doctors WHERE doctor_code = 'D-2004'), (SELECT id FROM appointments WHERE appointment_code = 'A-3002'), 4200, 0, 0, 4200, 'Pending', NULL, '2026-03-17', '2026-03-24', NULL, 'Pediatric check invoice'),
('B-4003', (SELECT id FROM patients WHERE patient_code = 'P-1003'), (SELECT id FROM doctors WHERE doctor_code = 'D-2002'), (SELECT id FROM appointments WHERE appointment_code = 'A-3003'), 15400, 0, 0, 15400, 'Overdue', NULL, '2026-03-10', '2026-03-17', NULL, 'Neurology consult invoice'),
('B-4004', (SELECT id FROM patients WHERE patient_code = 'P-1004'), (SELECT id FROM doctors WHERE doctor_code = 'D-2003'), (SELECT id FROM appointments WHERE appointment_code = 'A-3004'), 6900, 0, 0, 6900, 'Paid', 'UPI', '2026-03-12', '2026-03-19', '2026-03-12 11:30:00', 'Orthopedic review invoice'),
('B-4005', (SELECT id FROM patients WHERE patient_code = 'P-1005'), (SELECT id FROM doctors WHERE doctor_code = 'D-2005'), (SELECT id FROM appointments WHERE appointment_code = 'A-3005'), 5200, 0, 0, 5200, 'Paid', 'Cash', '2026-02-28', '2026-03-07', '2026-02-28 10:15:00', 'General consultation invoice'),
('B-4006', (SELECT id FROM patients WHERE patient_code = 'P-1006'), (SELECT id FROM doctors WHERE doctor_code = 'D-2006'), (SELECT id FROM appointments WHERE appointment_code = 'A-3006'), 4600, 0, 0, 4600, 'Pending', NULL, '2026-03-08', '2026-03-15', NULL, 'Skin evaluation invoice'),
('B-4007', (SELECT id FROM patients WHERE patient_code = 'P-1007'), (SELECT id FROM doctors WHERE doctor_code = 'D-2007'), (SELECT id FROM appointments WHERE appointment_code = 'A-3007'), 18200, 0, 0, 18200, 'Overdue', NULL, '2026-03-01', '2026-03-08', NULL, 'Oncology follow-up invoice'),
('B-4008', (SELECT id FROM patients WHERE patient_code = 'P-1008'), (SELECT id FROM doctors WHERE doctor_code = 'D-2008'), (SELECT id FROM appointments WHERE appointment_code = 'A-3008'), 3900, 0, 0, 3900, 'Paid', 'Card', '2026-03-20', '2026-03-27', '2026-03-20 12:00:00', 'Gynecology check invoice'),
('B-4009', (SELECT id FROM patients WHERE patient_code = 'P-1009'), (SELECT id FROM doctors WHERE doctor_code = 'D-2009'), (SELECT id FROM appointments WHERE appointment_code = 'A-3009'), 3100, 0, 0, 3100, 'Pending', NULL, '2026-03-19', '2026-03-26', NULL, 'ENT consultation invoice'),
('B-4010', (SELECT id FROM patients WHERE patient_code = 'P-1010'), (SELECT id FROM doctors WHERE doctor_code = 'D-2001'), (SELECT id FROM appointments WHERE appointment_code = 'A-3010'), 8700, 0, 0, 8700, 'Paid', 'Bank Transfer', '2026-03-05', '2026-03-12', '2026-03-05 18:00:00', 'Cardiology review invoice'),
('B-4011', (SELECT id FROM patients WHERE patient_code = 'P-1011'), (SELECT id FROM doctors WHERE doctor_code = 'D-2003'), (SELECT id FROM appointments WHERE appointment_code = 'A-3011'), 6400, 0, 0, 6400, 'Pending', NULL, '2026-03-15', '2026-03-22', NULL, 'Physio follow-up invoice'),
('B-4012', (SELECT id FROM patients WHERE patient_code = 'P-1012'), (SELECT id FROM doctors WHERE doctor_code = 'D-2004'), (SELECT id FROM appointments WHERE appointment_code = 'A-3012'), 4100, 0, 0, 4100, 'Paid', 'UPI', '2026-03-13', '2026-03-20', '2026-03-13 16:00:00', 'Pediatric check invoice'),
('B-4013', (SELECT id FROM patients WHERE patient_code = 'P-1013'), (SELECT id FROM doctors WHERE doctor_code = 'D-2002'), (SELECT id FROM appointments WHERE appointment_code = 'A-3013'), 11200, 0, 0, 11200, 'Overdue', NULL, '2026-03-07', '2026-03-14', NULL, 'Neuro diagnostic invoice'),
('B-4014', (SELECT id FROM patients WHERE patient_code = 'P-1014'), (SELECT id FROM doctors WHERE doctor_code = 'D-2006'), (SELECT id FROM appointments WHERE appointment_code = 'A-3014'), 3600, 0, 0, 3600, 'Paid', 'Cash', '2026-03-11', '2026-03-18', '2026-03-11 13:00:00', 'Dermatology review invoice'),
('B-4015', (SELECT id FROM patients WHERE patient_code = 'P-1015'), (SELECT id FROM doctors WHERE doctor_code = 'D-2005'), (SELECT id FROM appointments WHERE appointment_code = 'A-3015'), 5900, 0, 0, 5900, 'Pending', NULL, '2026-03-02', '2026-03-09', NULL, 'General check invoice');

INSERT INTO lab_orders (patient_id, doctor_id, test_name, result, status) VALUES
((SELECT id FROM patients WHERE patient_code = 'P-1001'), (SELECT id FROM doctors WHERE doctor_code = 'D-2001'), 'Lipid Profile', 'Borderline cholesterol elevation.', 'Completed'),
((SELECT id FROM patients WHERE patient_code = 'P-1003'), (SELECT id FROM doctors WHERE doctor_code = 'D-2002'), 'MRI Brain', '', 'Pending'),
((SELECT id FROM patients WHERE patient_code = 'P-1014'), (SELECT id FROM doctors WHERE doctor_code = 'D-2006'), 'Skin Allergy Panel', 'Mild dust allergy detected.', 'Completed');

INSERT INTO pharmacy (medicine_name, manufacturer, stock, price, status) VALUES
('Atorvastatin 10mg', 'Sun Pharma', 120, 185.00, 'Active'),
('Metformin 500mg', 'Cipla', 90, 115.00, 'Active'),
('Cetirizine 10mg', 'Dr. Reddy''s', 150, 48.00, 'Active'),
('Vitamin D3', 'Mankind', 80, 220.00, 'Active'),
('Omeprazole 20mg', 'Torrent', 60, 95.00, 'Active');
