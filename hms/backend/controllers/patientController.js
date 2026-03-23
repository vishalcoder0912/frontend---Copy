import { query } from "../config/db.js";

/**
 * Get all patients with pagination and filters.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 * @returns {Promise<import('express').Response|void>}
 */
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
      where += ` AND (name ILIKE $${idx} OR email ILIKE $${idx} OR phone ILIKE $${idx})`;
    }
    if (status) {
      params.push(status);
      where += ` AND status = $${params.length}`;
    }

    params.push(limit, offset);
    const dataQuery = `
      SELECT
        id,
        COALESCE(name, '') AS name,
        COALESCE(age, 0) AS age,
        COALESCE(gender, '') AS gender,
        COALESCE(blood_type, '') AS blood_type,
        COALESCE(phone, '') AS phone,
        COALESCE(email, '') AS email,
        COALESCE(address, '') AS address,
        COALESCE(medical_history, '') AS medical_history,
        COALESCE(status, 'Active') AS status,
        created_at,
        updated_at
      FROM patients
      ${where}
      ORDER BY created_at DESC
      LIMIT $${params.length - 1} OFFSET $${params.length}
    `;
    const countQuery = `SELECT COUNT(*) FROM patients ${where}`;

    const [dataResult, countResult] = await Promise.all([
      query(dataQuery, params),
      query(countQuery, params.slice(0, params.length - 2)),
    ]);

    const total = Number(countResult.rows[0].count);

    return res.json({
      success: true,
      data: dataResult.rows,
      pagination: { total, page, limit, pages: Math.max(1, Math.ceil(total / limit)) },
      message: "Patients fetched",
    });
  } catch (error) {
    console.error(error);
    return next(error);
  }
};

/**
 * Get a patient by id.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 * @returns {Promise<import('express').Response|void>}
 */
export const getPatientById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await query(
      `SELECT
        id,
        COALESCE(name, '') AS name,
        COALESCE(age, 0) AS age,
        COALESCE(gender, '') AS gender,
        COALESCE(blood_type, '') AS blood_type,
        COALESCE(phone, '') AS phone,
        COALESCE(email, '') AS email,
        COALESCE(address, '') AS address,
        COALESCE(medical_history, '') AS medical_history,
        COALESCE(status, 'Active') AS status,
        created_at,
        updated_at
       FROM patients WHERE id = $1`,
      [id]
    );
    if (!result.rows.length) {
      return res.status(404).json({ success: false, data: null, message: "Patient not found" });
    }
    return res.json({ success: true, data: result.rows[0], message: "Patient fetched" });
  } catch (error) {
    console.error(error);
    return next(error);
  }
};

/**
 * Create a patient.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 * @returns {Promise<import('express').Response|void>}
 */
export const createPatient = async (req, res, next) => {
  try {
    const { name, age, gender, blood_type, phone, email, address, medical_history, status } = req.body;
    const result = await query(
      `INSERT INTO patients (name, age, gender, blood_type, phone, email, address, medical_history, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [name, age, gender, blood_type, phone, email, address, medical_history, status || "Active"]
    );
    return res.status(201).json({ success: true, data: result.rows[0], message: "Patient created" });
  } catch (error) {
    console.error(error);
    return next(error);
  }
};

/**
 * Update a patient.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 * @returns {Promise<import('express').Response|void>}
 */
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
      email: req.body.email ?? current.email,
      address: req.body.address ?? current.address,
      medical_history: req.body.medical_history ?? current.medical_history,
      status: req.body.status ?? current.status,
    };

    const result = await query(
      `UPDATE patients
       SET name=$1, age=$2, gender=$3, blood_type=$4, phone=$5, email=$6, address=$7, medical_history=$8, status=$9, updated_at=NOW()
       WHERE id=$10 RETURNING *`,
      [
        payload.name,
        payload.age,
        payload.gender,
        payload.blood_type,
        payload.phone,
        payload.email,
        payload.address,
        payload.medical_history,
        payload.status,
        id,
      ]
    );

    return res.json({ success: true, data: result.rows[0], message: "Patient updated" });
  } catch (error) {
    console.error(error);
    return next(error);
  }
};

/**
 * Soft-delete a patient by setting status to Inactive.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 * @returns {Promise<import('express').Response|void>}
 */
export const deletePatient = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await query(
      "UPDATE patients SET status = 'Inactive', updated_at = NOW() WHERE id = $1 RETURNING *",
      [id]
    );
    if (!result.rows.length) {
      return res.status(404).json({ success: false, data: null, message: "Patient not found" });
    }
    return res.json({ success: true, data: result.rows[0], message: "Patient deactivated" });
  } catch (error) {
    console.error(error);
    return next(error);
  }
};
