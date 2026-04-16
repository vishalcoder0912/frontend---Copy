-- Comprehensive Billing System Database Schema
-- Medicare HMS - Enterprise Billing Module

-- ============================================
-- BILLING CONFIGURATION TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS billing_config (
    id INT AUTO_INCREMENT PRIMARY KEY,
    config_key VARCHAR(100) UNIQUE NOT NULL,
    config_value TEXT,
    config_type VARCHAR(50) DEFAULT 'string',
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default billing configuration
INSERT INTO billing_config (config_key, config_value, config_type, description) VALUES
('tax_rate', '18', 'number', 'Default GST tax rate percentage'),
('currency', 'INR', 'string', 'Currency code'),
('currency_symbol', '₹', 'string', 'Currency symbol'),
('payment_terms_days', '30', 'number', 'Default payment due days'),
('max_discount_percent', '20', 'number', 'Maximum allowed discount percentage'),
('discount_approval_threshold', '10', 'number', 'Discount requiring approval threshold'),
('upi_id', 'medicarehhospital@upi', 'string', 'UPI ID for QR payments'),
('bank_name', 'State Bank of India', 'string', 'Hospital bank name'),
('bank_account', '12345678901234', 'string', 'Hospital bank account number'),
('bank_ifsc', 'SBIN0001234', 'string', 'Bank IFSC code'),
('hospital_tax_id', '07AABCU9603R1Z0', 'string', 'Hospital GST/Tax ID'),
('invoice_prefix', 'INV', 'string', 'Invoice number prefix'),
('invoice_start_number', '1001', 'number', 'Starting invoice number');

-- ============================================
-- INSURANCE COMPANIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS insurance_companies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    company_code VARCHAR(50) UNIQUE NOT NULL,
    company_name VARCHAR(200) NOT NULL,
    contact_person VARCHAR(100),
    contact_phone VARCHAR(20),
    contact_email VARCHAR(100),
    coverage_percentage DECIMAL(5,2) DEFAULT 0,
    processing_days INT DEFAULT 15,
    is_network_hospital BOOLEAN DEFAULT TRUE,
    requires_auth BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert insurance companies
INSERT INTO insurance_companies (company_code, company_name, contact_person, contact_phone, contact_email, coverage_percentage, processing_days, is_network_hospital, requires_auth) VALUES
('AIN-001', 'Apollo Insurance', 'Rajesh Kumar', '1800-123-4567', 'claims@apolloinsurance.com', 80.00, 15, TRUE, TRUE),
('AIN-002', 'HDFC ERGO', 'Priya Sharma', '1800-234-5678', 'claims@hdfc-ergo.com', 75.00, 20, TRUE, TRUE),
('AIN-003', 'ICICI Lombard', 'Amit Patel', '1800-345-6789', 'claims@icici-lombard.com', 85.00, 10, TRUE, FALSE),
('AIN-004', 'National Insurance', 'Suresh Rao', '1800-456-7890', 'claims@national-insurance.com', 70.00, 25, TRUE, TRUE),
('AIN-005', 'Bajaj Allianz', 'Vikram Singh', '1800-567-8901', 'claims@bajaj-allianz.com', 80.00, 18, TRUE, TRUE);

-- ============================================
-- SERVICE MASTER TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS service_master (
    id INT AUTO_INCREMENT PRIMARY KEY,
    service_code VARCHAR(50) UNIQUE NOT NULL,
    service_name VARCHAR(200) NOT NULL,
    category VARCHAR(100),
    base_cost DECIMAL(12,2) DEFAULT 0,
    tax_rate DECIMAL(5,2) DEFAULT 0,
    tax_applicable BOOLEAN DEFAULT FALSE,
    insurance_coverage DECIMAL(5,2) DEFAULT 0,
    insurance_applicable BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert services
INSERT INTO service_master (service_code, service_name, category, base_cost, tax_rate, tax_applicable, insurance_coverage, description) VALUES
('SRV-001', 'General Consultation', 'Consultation', 500.00, 0, FALSE, 50.00, 'General physician consultation'),
('SRV-002', 'Specialist Consultation', 'Consultation', 1000.00, 0, FALSE, 60.00, 'Specialist doctor consultation'),
('SRV-003', 'Blood Test - Basic', 'Lab Test', 500.00, 0, FALSE, 80.00, 'Basic blood examination'),
('SRV-004', 'CT Scan', 'Diagnostic', 5000.00, 18.00, TRUE, 70.00, 'Computed Tomography scan'),
('SRV-005', 'X-Ray', 'Diagnostic', 1500.00, 18.00, TRUE, 75.00, 'X-ray imaging'),
('SRV-006', 'Minor Surgery', 'Procedure', 10000.00, 18.00, TRUE, 65.00, 'Minor surgical procedure'),
('SRV-007', 'Major Surgery', 'Procedure', 50000.00, 18.00, TRUE, 70.00, 'Major surgical procedure'),
('SRV-008', 'ICU Room (Per Day)', 'Room Charges', 5000.00, 18.00, TRUE, 80.00, 'Intensive Care Unit daily charge'),
('SRV-009', 'General Ward (Per Day)', 'Room Charges', 2000.00, 18.00, TRUE, 85.00, 'General ward daily charge'),
('SRV-010', 'Pharmacy Charges', 'Pharmacy', 0.00, 5.00, TRUE, 60.00, 'Medicines and supplies'),
('SRV-011', 'Ultrasound', 'Diagnostic', 2000.00, 18.00, TRUE, 75.00, 'Ultrasound imaging'),
('SRV-012', 'ECG', 'Diagnostic', 500.00, 18.00, TRUE, 90.00, 'Electrocardiogram'),
('SRV-013', 'Dental Cleaning', 'Dental', 1500.00, 18.00, TRUE, 40.00, 'Dental cleaning procedure'),
('SRV-014', 'Vaccination', 'Preventive', 500.00, 0, FALSE, 100.00, 'Vaccination dose'),
('SRV-015', 'Follow-up Consultation', 'Consultation', 300.00, 0, FALSE, 50.00, 'Follow-up visit');

-- ============================================
-- DISCOUNT POLICIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS discount_policies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    policy_code VARCHAR(50) UNIQUE NOT NULL,
    policy_name VARCHAR(200) NOT NULL,
    discount_type ENUM('percentage', 'fixed') DEFAULT 'percentage',
    discount_value DECIMAL(10,2) DEFAULT 0,
    applies_to VARCHAR(100),
    eligibility_criteria TEXT,
    requires_approval BOOLEAN DEFAULT FALSE,
    max_discount DECIMAL(10,2),
    is_active BOOLEAN DEFAULT TRUE,
    valid_from DATE,
    valid_till DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert discount policies
INSERT INTO discount_policies (policy_code, policy_name, discount_type, discount_value, applies_to, eligibility_criteria, requires_approval, valid_from, valid_till) VALUES
('DC-001', 'Professional Courtesy', 'percentage', 10.00, 'Consultation, Follow-up', 'Staff members and their families', FALSE, '2026-01-01', '2026-12-31'),
('DC-002', 'Senior Citizen Discount', 'percentage', 15.00, 'All services except emergency', 'Patients aged 60+', FALSE, '2026-01-01', '2026-12-31'),
('DC-003', 'Volume Discount', 'percentage', 5.00, 'Surgery, Procedure, Hospitalization', 'All patients - 5% for amounts up to 10,000, 10% above', TRUE, '2026-01-01', '2026-12-31'),
('DC-004', 'Emergency Care Discount', 'percentage', 15.00, 'Emergency surgery, Critical care', 'All emergency care patients', TRUE, '2026-01-01', '2026-12-31'),
('DC-005', 'Cashless Insurance', 'fixed', 500.00, 'All insured services', 'Patients with active insurance', FALSE, '2026-01-01', '2026-12-31'),
('DC-006', 'Early Payment Discount', 'percentage', 2.00, 'All services', 'Payment within 7 days of invoice', FALSE, '2026-01-01', '2026-12-31');

-- ============================================
-- INVOICES TABLE (Enhanced)
-- ============================================
CREATE TABLE IF NOT EXISTS invoices (
    id INT AUTO_INCREMENT PRIMARY KEY,
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    patient_id INT,
    patient_name VARCHAR(200) NOT NULL,
    patient_phone VARCHAR(20),
    patient_email VARCHAR(100),
    doctor_id INT,
    doctor_name VARCHAR(200),
    department VARCHAR(100),
    service_type VARCHAR(100),
    invoice_date DATE NOT NULL,
    due_date DATE NOT NULL,
    subtotal DECIMAL(12,2) DEFAULT 0,
    tax_amount DECIMAL(12,2) DEFAULT 0,
    discount_amount DECIMAL(12,2) DEFAULT 0,
    discount_reason VARCHAR(200),
    total_amount DECIMAL(12,2) DEFAULT 0,
    insurance_id INT,
    insurance_company VARCHAR(200),
    insurance_policy_number VARCHAR(100),
    insurance_coverage_percent DECIMAL(5,2),
    insurance_payable DECIMAL(12,2) DEFAULT 0,
    patient_payable DECIMAL(12,2) DEFAULT 0,
    amount_paid DECIMAL(12,2) DEFAULT 0,
    payment_status ENUM('Pending', 'Partial', 'Paid', 'Overdue', 'Cancelled', 'Refunded') DEFAULT 'Pending',
    payment_method VARCHAR(50),
    payment_date DATE,
    qr_code_data TEXT,
    notes TEXT,
    created_by VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE SET NULL,
    FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE SET NULL,
    FOREIGN KEY (insurance_id) REFERENCES insurance_companies(id) ON DELETE SET NULL
);

-- Create indexes for invoices
CREATE INDEX idx_invoices_patient ON invoices(patient_id);
CREATE INDEX idx_invoices_status ON invoices(payment_status);
CREATE INDEX idx_invoices_date ON invoices(invoice_date);
CREATE INDEX idx_invoices_due ON invoices(due_date);

-- ============================================
-- INVOICE ITEMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS invoice_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    invoice_id INT NOT NULL,
    service_id INT,
    service_code VARCHAR(50),
    service_name VARCHAR(200) NOT NULL,
    quantity DECIMAL(10,2) DEFAULT 1,
    rate DECIMAL(12,2) NOT NULL,
    tax_rate DECIMAL(5,2) DEFAULT 0,
    tax_amount DECIMAL(12,2) DEFAULT 0,
    amount DECIMAL(12,2) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE,
    FOREIGN KEY (service_id) REFERENCES service_master(id) ON DELETE SET NULL
);

CREATE INDEX idx_invoice_items_invoice ON invoice_items(invoice_id);

-- ============================================
-- PAYMENT RECORDS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS payment_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    invoice_id INT NOT NULL,
    payment_type ENUM('Patient', 'Insurance') DEFAULT 'Patient',
    payment_date DATETIME NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    payment_method VARCHAR(50),
    transaction_id VARCHAR(100),
    reference_number VARCHAR(100),
    receipt_number VARCHAR(50),
    processed_by VARCHAR(100),
    notes TEXT,
    reconciliation_status ENUM('Pending', 'Matched', 'Discrepancy') DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
);

CREATE INDEX idx_payments_invoice ON payment_records(invoice_id);
CREATE INDEX idx_payments_date ON payment_records(payment_date);

-- ============================================
-- PAYMENT REMINDERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS payment_reminders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    invoice_id INT NOT NULL,
    reminder_type ENUM('Invoice', 'Reminder1', 'Reminder2', 'Urgent', 'Final') DEFAULT 'Reminder1',
    scheduled_date DATE,
    sent_date DATETIME,
    sent_via ENUM('Email', 'SMS', 'Call', 'Email+SMS', 'All') DEFAULT 'Email',
    recipient_email VARCHAR(100),
    recipient_phone VARCHAR(20),
    message TEXT,
    status ENUM('Scheduled', 'Sent', 'Failed', 'Cancelled') DEFAULT 'Scheduled',
    response TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
);

CREATE INDEX idx_reminders_invoice ON payment_reminders(invoice_id);
CREATE INDEX idx_reminders_status ON payment_reminders(status);
CREATE INDEX idx_reminders_scheduled ON payment_reminders(scheduled_date);

-- ============================================
-- FINANCIAL ANALYTICS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS financial_analytics (
    id INT AUTO_INCREMENT PRIMARY KEY,
    analytics_date DATE NOT NULL,
    analytics_type VARCHAR(50) NOT NULL,
    category VARCHAR(100),
    total_revenue DECIMAL(14,2) DEFAULT 0,
    total_invoices INT DEFAULT 0,
    paid_amount DECIMAL(14,2) DEFAULT 0,
    pending_amount DECIMAL(14,2) DEFAULT 0,
    overdue_amount DECIMAL(14,2) DEFAULT 0,
    collection_rate DECIMAL(5,2),
    department VARCHAR(100),
    doctor_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_analytics (analytics_date, analytics_type, category)
);

CREATE INDEX idx_analytics_date ON financial_analytics(analytics_date);
CREATE INDEX idx_analytics_type ON financial_analytics(analytics_type);

-- ============================================
-- Insert sample invoices with complete data
-- ============================================
INSERT INTO invoices (invoice_number, patient_id, patient_name, patient_phone, patient_email, doctor_id, doctor_name, department, service_type, invoice_date, due_date, subtotal, tax_amount, discount_amount, discount_reason, total_amount, insurance_id, insurance_company, insurance_policy_number, insurance_coverage_percent, insurance_payable, patient_payable, amount_paid, payment_status, payment_method, payment_date, qr_code_data, notes) VALUES
('INV-2026-001', 1, 'Aarav Mehta', '+91 98765 43210', 'aarav.mehta@email.com', 1, 'Dr. Kavya Rao', 'Cardiology', 'Major Surgery', '2026-03-18', '2026-04-18', 80000.00, 11200.00, 13680.00, 'Emergency Care Discount', 77520.00, 1, 'Apollo Insurance', 'POL-2024-001234', 80.00, 62016.00, 15504.00, 77520.00, 'Paid', 'Bank Transfer', '2026-03-22', 'upi://pay?pa=medicarehhospital@upi&pn=Medicare%20Hospital&tn=INV-2026-001&am=15504', 'Major surgery with ICU stay'),
('INV-2026-002', 4, 'Ishita Rao', '+91 98765 43211', 'ishita.rao@email.com', 2, 'Dr. Sana Mirza', 'Neurology', 'Consultation', '2026-03-17', '2026-04-17', 4000.00, 360.00, 0.00, NULL, 4360.00, 5, 'Bajaj Allianz', 'POL-2024-001237', 80.00, 3488.00, 872.00, 0.00, 'Pending', NULL, NULL, 'upi://pay?pa=medicarehhospital@upi&pn=Medicare%20Hospital&tn=INV-2026-002&am=872', 'Consultation and tests'),
('INV-2026-003', 3, 'Dev Patel', '+91 98765 43218', 'dev.patel@email.com', 9, 'Dr. Rahul Sen', 'Ophthalmology', 'Diagnostic', '2026-03-19', '2026-04-19', 4450.00, 450.00, 0.00, NULL, 4900.00, 3, 'ICICI Lombard', 'POL-2024-001236', 85.00, 4165.00, 735.00, 0.00, 'Pending', NULL, NULL, 'upi://pay?pa=medicarehhospital@upi&pn=Medicare%20Hospital&tn=INV-2026-003&am=735', 'Eye examination and ECG'),
('INV-2026-004', 2, 'Sara Khan', '+91 98765 43217', 'sara.khan@email.com', 8, 'Dr. Leena Iyer', 'Dermatology', 'Consultation', '2026-03-20', '2026-04-20', 6500.00, 990.00, 0.00, NULL, 7490.00, 2, 'HDFC ERGO', 'POL-2024-001235', 75.00, 5618.00, 1872.00, 7490.00, 'Paid', 'Cash', '2026-03-25', 'upi://pay?pa=medicarehhospital@upi&pn=Medicare%20Hospital&tn=INV-2026-004&am=1872', 'X-Ray and consultation'),
('INV-2026-005', 5, 'TestPatient_1776312320433', '+91 9999999999', 'test@example.com', NULL, 'Dr. Workflow Test', 'General', 'Consultation', '2026-04-16', '2026-05-16', 500.00, 0.00, 0.00, NULL, 500.00, NULL, NULL, NULL, NULL, 0.00, 500.00, 0.00, 'Pending', NULL, NULL, 'upi://pay?pa=medicarehhospital@upi&pn=Medicare%20Hospital&tn=INV-2026-005&am=500', 'Test consultation'),
('INV-2026-006', 6, 'TestPatient_1776312135141', '+91 8888888888', 'test2@example.com', NULL, 'Dr. Workflow Test', 'General', 'Consultation', '2026-04-16', '2026-05-16', 1000.00, 0.00, 0.00, NULL, 1000.00, 4, 'National Insurance', 'POL-2024-001238', 70.00, 700.00, 300.00, 0.00, 'Pending', NULL, NULL, 'upi://pay?pa=medicarehhospital@upi&pn=Medicare%20Hospital&tn=INV-2026-006&am=300', 'Test with insurance');

-- Insert invoice items
INSERT INTO invoice_items (invoice_id, service_id, service_code, service_name, quantity, rate, tax_rate, tax_amount, amount) VALUES
-- Invoice 1 items
(1, 7, 'SRV-007', 'Major Surgery', 1, 50000.00, 18.00, 9000.00, 59000.00),
(1, 8, 'SRV-008', 'ICU Room (Per Day)', 2, 5000.00, 18.00, 1800.00, 11800.00),
(1, 10, 'SRV-010', 'Pharmacy Charges', 1, 8000.00, 5.00, 400.00, 8400.00),
-- Invoice 2 items
(2, 2, 'SRV-002', 'Specialist Consultation', 1, 1000.00, 0.00, 0.00, 1000.00),
(2, 14, 'SRV-014', 'Vaccination', 3, 500.00, 0.00, 0.00, 1500.00),
(2, 3, 'SRV-003', 'Blood Test - Basic', 1, 500.00, 0.00, 0.00, 500.00),
(2, 9, 'SRV-009', 'General Ward (Per Day)', 1, 2000.00, 18.00, 360.00, 2360.00),
-- Invoice 3 items
(3, 12, 'SRV-012', 'ECG', 1, 500.00, 18.00, 90.00, 590.00),
(3, 3, 'SRV-003', 'Blood Test - Basic', 1, 500.00, 0.00, 0.00, 500.00),
(3, 2, 'SRV-002', 'Specialist Consultation', 1, 1000.00, 0.00, 0.00, 1000.00),
(3, 9, 'SRV-009', 'General Ward (Per Day)', 1, 2000.00, 18.00, 360.00, 2360.00),
-- Invoice 4 items
(4, 5, 'SRV-005', 'X-Ray', 1, 1500.00, 18.00, 270.00, 1770.00),
(4, 1, 'SRV-001', 'General Consultation', 1, 500.00, 0.00, 0.00, 500.00),
(4, 9, 'SRV-009', 'General Ward (Per Day)', 2, 2000.00, 18.00, 720.00, 4720.00),
-- Invoice 5 items
(5, 1, 'SRV-001', 'General Consultation', 1, 500.00, 0.00, 0.00, 500.00),
-- Invoice 6 items
(6, 2, 'SRV-002', 'Specialist Consultation', 1, 1000.00, 0.00, 0.00, 1000.00);

-- Insert payment records for paid invoices
INSERT INTO payment_records (invoice_id, payment_type, payment_date, amount, payment_method, transaction_id, receipt_number, processed_by, reconciliation_status) VALUES
(1, 'Patient', '2026-03-22 16:30:00', 15504.00, 'Bank Transfer', 'NEFT2026123456', 'RCP-2026-00345', 'Finance Manager (Rajesh Kumar)', 'Matched'),
(1, 'Insurance', '2026-03-25 10:00:00', 62016.00, 'Bank Transfer', 'APL-CLM-2026-003', NULL, 'Finance Manager (Rajesh Kumar)', 'Matched'),
(4, 'Patient', '2026-03-25 11:15:00', 1872.00, 'Cash', NULL, 'RCP-2026-00234', 'Billing Officer (Amit Patel)', 'Matched'),
(4, 'Insurance', '2026-03-28 09:30:00', 5618.00, 'Bank Transfer', 'HDF-CLM-2026-002', NULL, 'Finance Manager (Rajesh Kumar)', 'Matched');

-- Insert payment reminders
INSERT INTO payment_reminders (invoice_id, reminder_type, scheduled_date, sent_date, sent_via, recipient_email, recipient_phone, message, status) VALUES
(3, 'Reminder1', '2026-04-02', '2026-04-02 09:00:00', 'Email', 'dev.patel@email.com', '+91 98765 43218', 'Your invoice INV-2026-003 for ₹735 is due on Apr 19, 2026.', 'Sent'),
(2, 'Reminder1', '2026-04-10', '2026-04-10 09:00:00', 'Email', 'ishita.rao@email.com', '+91 98765 43211', 'Your invoice INV-2026-002 for ₹872 is due on Apr 17, 2026.', 'Sent');

-- Insert financial analytics
INSERT INTO financial_analytics (analytics_date, analytics_type, category, total_revenue, total_invoices, paid_amount, pending_amount, collection_rate) VALUES
('2026-03-18', 'Daily', 'Cardiology', 77520.00, 1, 77520.00, 0.00, 100.00),
('2026-03-19', 'Daily', 'Ophthalmology', 4900.00, 1, 0.00, 4900.00, 0.00),
('2026-03-20', 'Daily', 'Dermatology', 7490.00, 1, 7490.00, 0.00, 100.00),
('2026-03-17', 'Daily', 'Neurology', 4360.00, 1, 0.00, 4360.00, 0.00),
('2026-04-16', 'Daily', 'General', 1500.00, 2, 0.00, 1500.00, 0.00);

-- Monthly summary
INSERT INTO financial_analytics (analytics_date, analytics_type, category, total_revenue, total_invoices, paid_amount, pending_amount, collection_rate) VALUES
('2026-03-01', 'Monthly', 'All Departments', 94770.00, 4, 85010.00, 9760.00, 89.70),
('2026-04-01', 'Monthly', 'All Departments', 1500.00, 2, 0.00, 1500.00, 0.00);
