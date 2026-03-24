import { query } from "../config/db.js";

const patientSelect = `
  SELECT
    id,
    patient_code,
    COALESCE(name, '') AS name,
    COALESCE(age, 0) AS age,
    COALESCE(gender, '') AS gender,
    COALESCE(blood_type, '') AS blood_type,
    COALESCE(phone, '') AS phone,
    COALESCE(email, '') AS email,
    COALESCE(address, '') AS address,
    COALESCE(medical_history, '') AS medical_history,
    last_visit,
    COALESCE(status, 'Active') AS status,
    created_at,
    updated_at
  FROM patients
`;

const createPatientCode = async () => {
  const result = await query(
    "SELECT COALESCE(MAX(CAST(SUBSTRING(patient_code FROM 3) AS INTEGER)), 1000) + 1 AS next_code FROM patients"
  );
  return `P-${String(result.rows[0].next_code).padStart(4, "0")}`;
};

export const getAllPatients = async (req, res, next) => {
  try {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 10);
    const search = req.query.search || "";
    const status = req.query.status || "";
    const offset = (page - 1) * limit;

    const params = [];
    let where = "WHERE 1=1";

    if (search) {
      params.push(`%${search}%`);
      const idx = params.length;
      where += ` AND (name ILIKE $${idx} OR email ILIKE $${idx} OR phone ILIKE $${idx} OR patient_code ILIKE $${idx})`;
    }
    if (status) {
      params.push(status);
      where += ` AND status = $${params.length}`;
    }

    params.push(limit, offset);

    const [itemsResult, countResult] = await Promise.all([
      query(
        `${patientSelect} ${where} ORDER BY created_at DESC, id DESC LIMIT $${params.length - 1} OFFSET $${params.length}`,
        params
      ),
      query(`SELECT COUNT(*) FROM patients ${where}`, params.slice(0, -2)),
    ]);

    const total = Number(countResult.rows[0].count);

    return res.json({
      success: true,
      data: {
        items: itemsResult.rows,
        pagination: { total, page, limit, pages: Math.max(1, Math.ceil(total / limit)) },
      },
      message: "Patients fetched",
    });
  } catch (error) {
    return next(error);
  }
};

export const getPatientById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await query(`${patientSelect} WHERE id = $1`, [id]);

    if (!result.rows.length) {
      return res.status(404).json({ success: false, data: null, message: "Patient not found" });
    }

    return res.json({ success: true, data: result.rows[0], message: "Patient fetched" });
  } catch (error) {
    return next(error);
  }
};

export const createPatient = async (req, res, next) => {
  try {
    const patientCode = await createPatientCode();
    const {
      name,
      age,
      gender,
      blood_type,
      phone,
      email,
      address,
      medical_history,
      last_visit,
      status,
    } = req.body;

    const result = await query(
      `INSERT INTO patients (
        patient_code, name, age, gender, blood_type, phone, email, address, medical_history, last_visit, status
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
      RETURNING id`,
      [
        patientCode,
        name,
        age ?? 0,
        gender ?? "",
        blood_type ?? "",
        phone ?? "",
        email || null,
        address || null,
        medical_history || null,
        last_visit || null,
        status || "Active",
      ]
    );

    const created = await query(`${patientSelect} WHERE id = $1`, [result.rows[0].id]);
    return res.status(201).json({ success: true, data: created.rows[0], message: "Patient created" });
  } catch (error) {
    return next(error);
  }
};

export const updatePatient = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await query("SELECT * FROM patients WHERE id = $1", [id]);

    if (!existing.rows.length) {
      return res.status(404).json({ success: false, data: null, message: "Patient not found" });
    }

    const current = existing.rows[0];
    const payload = {
      name: req.body.name ?? current.name,
      age: req.body.age ?? current.age,
      gender: req.body.gender ?? current.gender,
      blood_type: req.body.blood_type ?? current.blood_type,
      phone: req.body.phone ?? current.phone,
      email: req.body.email === "" ? null : req.body.email ?? current.email,
      address: req.body.address ?? current.address,
      medical_history: req.body.medical_history ?? current.medical_history,
      last_visit: req.body.last_visit ?? current.last_visit,
      status: req.body.status ?? current.status,
    };

    await query(
      `UPDATE patients
       SET name = $1,
           age = $2,
           gender = $3,
           blood_type = $4,
           phone = $5,
           email = $6,
           address = $7,
           medical_history = $8,
           last_visit = $9,
           status = $10,
           updated_at = NOW()
       WHERE id = $11`,
      [
        payload.name,
        payload.age,
        payload.gender,
        payload.blood_type,
        payload.phone,
        payload.email,
        payload.address,
        payload.medical_history,
        payload.last_visit,
        payload.status,
        id,
      ]
    );

    const updated = await query(`${patientSelect} WHERE id = $1`, [id]);
    return res.json({ success: true, data: updated.rows[0], message: "Patient updated" });
  } catch (error) {
    return next(error);
  }
};

export const deletePatient = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await query("DELETE FROM patients WHERE id = $1 RETURNING id, patient_code, name", [id]);

    if (!result.rows.length) {
      return res.status(404).json({ success: false, data: null, message: "Patient not found" });
    }

    return res.json({ success: true, data: result.rows[0], message: "Patient deleted" });
  } catch (error) {
    return next(error);
  }
};
