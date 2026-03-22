CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role VARCHAR(20) DEFAULT 'staff',
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP,
  reset_token TEXT,
  reset_token_expires TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS patients (
  id SERIAL PRIMARY KEY,
  patient_id VARCHAR(20) UNIQUE,
  name VARCHAR(100) NOT NULL,
  age INTEGER,
  dob DATE,
  gender VARCHAR(10),
  blood_type VARCHAR(5),
  phone VARCHAR(20),
  email VARCHAR(100),
  address TEXT,
  emergency_contact VARCHAR(100),
  emergency_phone VARCHAR(20),
  medical_history TEXT,
  allergies TEXT,
  avatar_url TEXT,
  status VARCHAR(20) DEFAULT 'Active',
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS doctors (
  id SERIAL PRIMARY KEY,
  doctor_id VARCHAR(20) UNIQUE,
  name VARCHAR(100) NOT NULL,
  specialization VARCHAR(100),
  qualification VARCHAR(200),
  experience INTEGER,
  phone VARCHAR(20),
  email VARCHAR(100) UNIQUE,
  availability VARCHAR(20) DEFAULT 'Available',
  working_hours JSONB,
  rating DECIMAL(2,1) DEFAULT 0,
  avatar_url TEXT,
  bio TEXT,
  status VARCHAR(20) DEFAULT 'Active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS appointments (
  id SERIAL PRIMARY KEY,
  appointment_id VARCHAR(20) UNIQUE,
  patient_id INTEGER REFERENCES patients(id)
    ON DELETE CASCADE,
  doctor_id INTEGER REFERENCES doctors(id)
    ON DELETE CASCADE,
  appointment_date TIMESTAMP NOT NULL,
  duration INTEGER DEFAULT 30,
  type VARCHAR(50),
  status VARCHAR(20) DEFAULT 'Scheduled',
  notes TEXT,
  symptoms TEXT,
  prescription TEXT,
  follow_up_date DATE,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS billing (
  id SERIAL PRIMARY KEY,
  invoice_id VARCHAR(20) UNIQUE,
  patient_id INTEGER REFERENCES patients(id)
    ON DELETE CASCADE,
  doctor_id INTEGER REFERENCES doctors(id),
  appointment_id INTEGER REFERENCES
    appointments(id),
  amount DECIMAL(10,2) NOT NULL,
  discount DECIMAL(10,2) DEFAULT 0,
  tax DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2),
  status VARCHAR(20) DEFAULT 'Pending',
  payment_method VARCHAR(50),
  invoice_date TIMESTAMP DEFAULT NOW(),
  due_date TIMESTAMP,
  paid_at TIMESTAMP,
  notes TEXT,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS file_uploads (
  id SERIAL PRIMARY KEY,
  original_name VARCHAR(255),
  stored_name VARCHAR(255),
  file_path TEXT,
  file_type VARCHAR(50),
  file_size INTEGER,
  entity_type VARCHAR(50),
  entity_id INTEGER,
  uploaded_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id)
    ON DELETE CASCADE,
  title VARCHAR(200),
  message TEXT,
  type VARCHAR(50),
  is_read BOOLEAN DEFAULT false,
  entity_type VARCHAR(50),
  entity_id INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS activity_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  action VARCHAR(100),
  entity_type VARCHAR(50),
  entity_id INTEGER,
  details JSONB,
  ip_address VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);
