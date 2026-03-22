CREATE TABLE IF NOT EXISTS patients (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  age INTEGER,
  gender VARCHAR(10),
  blood_type VARCHAR(5),
  phone VARCHAR(20),
  email VARCHAR(100) UNIQUE,
  address TEXT,
  medical_history TEXT,
  status VARCHAR(20) DEFAULT 'Active',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS doctors (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  specialization VARCHAR(100),
  experience INTEGER,
  phone VARCHAR(20),
  email VARCHAR(100) UNIQUE,
  availability VARCHAR(20) DEFAULT 'Available',
  rating DECIMAL(2,1),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS appointments (
  id SERIAL PRIMARY KEY,
  patient_id INTEGER REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id INTEGER REFERENCES doctors(id) ON DELETE CASCADE,
  appointment_date TIMESTAMP NOT NULL,
  type VARCHAR(50),
  status VARCHAR(20) DEFAULT 'Scheduled',
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS billing (
  id SERIAL PRIMARY KEY,
  patient_id INTEGER REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id INTEGER REFERENCES doctors(id) ON DELETE CASCADE,
  appointment_id INTEGER REFERENCES appointments(id),
  amount DECIMAL(10,2),
  status VARCHAR(20) DEFAULT 'Pending',
  invoice_date TIMESTAMP DEFAULT NOW(),
  due_date TIMESTAMP,
  paid_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100),
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role VARCHAR(20) DEFAULT 'staff',
  created_at TIMESTAMP DEFAULT NOW()
);
