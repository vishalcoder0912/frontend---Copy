import { query } from "../config/db.js";

export const getAllDoctors = async (req, res, next) => {
  try {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 10);
    const search = req.query.search || "";
    const availability = req.query.availability || "";
    const offset = (page - 1) * limit;

    const params = [];
    let where = "WHERE 1=1";

    if (search) {
      params.push(`%${search}%`);
      const idx = params.length;
      where += ` AND (name ILIKE $${idx} OR specialization ILIKE $${idx})`;
    }
    if (availability) {
      params.push(availability);
      where += ` AND availability = $${params.length}`;
    }

    params.push(limit, offset);
    const dataQuery = `SELECT * FROM doctors ${where} ORDER BY created_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`;
    const countQuery = `SELECT COUNT(*) FROM doctors ${where}`;

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
      message: "Doctors fetched",
    });
  } catch (error) {
    next(error);
  }
};

export const getDoctorById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await query("SELECT * FROM doctors WHERE id = $1", [id]);
    if (!result.rows.length) {
      return res.status(404).json({ success: false, data: null, message: "Doctor not found" });
    }
    return res.json({ success: true, data: result.rows[0], message: "Doctor fetched" });
  } catch (error) {
    next(error);
  }
};

export const createDoctor = async (req, res, next) => {
  try {
    const { name, specialization, experience, phone, email, availability, rating } = req.body;
    const result = await query(
      `INSERT INTO doctors (name, specialization, experience, phone, email, availability, rating)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [name, specialization, experience, phone, email, availability || "Available", rating]
    );
    return res.status(201).json({ success: true, data: result.rows[0], message: "Doctor created" });
  } catch (error) {
    next(error);
  }
};

export const updateDoctor = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await query("SELECT * FROM doctors WHERE id = $1", [id]);
    if (!existing.rows.length) {
      return res.status(404).json({ success: false, data: null, message: "Doctor not found" });
    }

    const current = existing.rows[0];
    const payload = {
      name: req.body.name ?? current.name,
      specialization: req.body.specialization ?? current.specialization,
      experience: req.body.experience ?? current.experience,
      phone: req.body.phone ?? current.phone,
      email: req.body.email ?? current.email,
      availability: req.body.availability ?? current.availability,
      rating: req.body.rating ?? current.rating,
    };

    const result = await query(
      `UPDATE doctors
       SET name=$1, specialization=$2, experience=$3, phone=$4, email=$5, availability=$6, rating=$7
       WHERE id=$8 RETURNING *`,
      [
        payload.name,
        payload.specialization,
        payload.experience,
        payload.phone,
        payload.email,
        payload.availability,
        payload.rating,
        id,
      ]
    );

    return res.json({ success: true, data: result.rows[0], message: "Doctor updated" });
  } catch (error) {
    next(error);
  }
};

export const deleteDoctor = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await query("DELETE FROM doctors WHERE id = $1 RETURNING *", [id]);
    if (!result.rows.length) {
      return res.status(404).json({ success: false, data: null, message: "Doctor not found" });
    }
    return res.json({ success: true, data: result.rows[0], message: "Doctor deleted" });
  } catch (error) {
    next(error);
  }
};
