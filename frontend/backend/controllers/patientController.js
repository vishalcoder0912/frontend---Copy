import { query } from "../config/db.js";

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
    const dataQuery = `SELECT * FROM patients ${where} ORDER BY created_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`;
    const countQuery = `SELECT COUNT(*) FROM patients ${where}`;

    const [dataResult, countResult] = await Promise.all([
      query(dataQuery, params),
      query(countQuery, params.slice(0, params.length - 2)),
    ]);

    return res.json({
      success: true,
      data: {
        items: dataResult.rows,
        total: Number(countResult.rows[0].count),
        page,
        limit,
      },
      message: "Patients fetched",
    });
  } catch (error) {
    next(error);
  }
};

export const getPatientById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await query("SELECT * FROM patients WHERE id = $1", [id]);
    if (!result.rows.length) {
      return res.status(404).json({ success: false, data: null, message: "Patient not found" });
    }
    return res.json({ success: true, data: result.rows[0], message: "Patient fetched" });
  } catch (error) {
    next(error);
  }
};

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
    next(error);
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
      email: req.body.email ?? current.email,
      address: req.body.address ?? current.address,
      medical_history: req.body.medical_history ?? current.medical_history,
      status: req.body.status ?? current.status,
    };

    const result = await query(
      `UPDATE patients
       SET name=$1, age=$2, gender=$3, blood_type=$4, phone=$5, email=$6, address=$7, medical_history=$8, status=$9
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
    next(error);
  }
};

export const deletePatient = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await query("DELETE FROM patients WHERE id = $1 RETURNING *", [id]);
    if (!result.rows.length) {
      return res.status(404).json({ success: false, data: null, message: "Patient not found" });
    }
    return res.json({ success: true, data: result.rows[0], message: "Patient deleted" });
  } catch (error) {
    next(error);
  }
};
