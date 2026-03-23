import { query } from "../config/db.js";

/**
 * Get all doctors with pagination and filters.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 * @returns {Promise<import('express').Response|void>}
 */
export const getAllDoctors = async (req, res, next) => {
  try {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 10);
    const search = req.query.search || "";
    const availability = req.query.availability || "";
    const status = req.query.status || "";
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
    if (status) {
      params.push(status);
      where += ` AND status = $${params.length}`;
    }

    params.push(limit, offset);
    const dataQuery = `
      SELECT
        id,
        COALESCE(name, '') AS name,
        COALESCE(specialization, '') AS specialization,
        COALESCE(qualification, '') AS qualification,
        COALESCE(experience, 0) AS experience,
        COALESCE(phone, '') AS phone,
        COALESCE(email, '') AS email,
        COALESCE(availability, 'Available') AS availability,
        COALESCE(rating, 0) AS rating,
        COALESCE(bio, '') AS bio,
        COALESCE(status, 'Active') AS status,
        COALESCE(working_hours, '{}'::jsonb) AS working_hours,
        created_at,
        updated_at
      FROM doctors
      ${where}
      ORDER BY created_at DESC
      LIMIT $${params.length - 1} OFFSET $${params.length}
    `;
    const countQuery = `SELECT COUNT(*) FROM doctors ${where}`;

    const [dataResult, countResult] = await Promise.all([
      query(dataQuery, params),
      query(countQuery, params.slice(0, params.length - 2)),
    ]);

    const total = Number(countResult.rows[0].count);

    return res.json({
      success: true,
      data: dataResult.rows,
      pagination: { total, page, limit, pages: Math.max(1, Math.ceil(total / limit)) },
      message: "Doctors fetched",
    });
  } catch (error) {
    console.error(error);
    return next(error);
  }
};

/**
 * Get a doctor by id.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 * @returns {Promise<import('express').Response|void>}
 */
export const getDoctorById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await query(
      `SELECT
        id,
        COALESCE(name, '') AS name,
        COALESCE(specialization, '') AS specialization,
        COALESCE(qualification, '') AS qualification,
        COALESCE(experience, 0) AS experience,
        COALESCE(phone, '') AS phone,
        COALESCE(email, '') AS email,
        COALESCE(availability, 'Available') AS availability,
        COALESCE(rating, 0) AS rating,
        COALESCE(bio, '') AS bio,
        COALESCE(status, 'Active') AS status,
        COALESCE(working_hours, '{}'::jsonb) AS working_hours,
        created_at,
        updated_at
       FROM doctors WHERE id = $1`,
      [id]
    );
    if (!result.rows.length) {
      return res.status(404).json({ success: false, data: null, message: "Doctor not found" });
    }
    return res.json({ success: true, data: result.rows[0], message: "Doctor fetched" });
  } catch (error) {
    console.error(error);
    return next(error);
  }
};

/**
 * Create a doctor.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 * @returns {Promise<import('express').Response|void>}
 */
export const createDoctor = async (req, res, next) => {
  try {
    const { name, specialization, qualification, experience, phone, email, availability, rating, bio, status, working_hours } = req.body;
    const result = await query(
      `INSERT INTO doctors (name, specialization, qualification, experience, phone, email, availability, rating, bio, status, working_hours)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
      [
        name,
        specialization,
        qualification,
        experience,
        phone,
        email,
        availability || "Available",
        rating,
        bio,
        status || "Active",
        working_hours,
      ]
    );
    return res.status(201).json({ success: true, data: result.rows[0], message: "Doctor created" });
  } catch (error) {
    console.error(error);
    return next(error);
  }
};

/**
 * Update a doctor.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 * @returns {Promise<import('express').Response|void>}
 */
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
      qualification: req.body.qualification ?? current.qualification,
      experience: req.body.experience ?? current.experience,
      phone: req.body.phone ?? current.phone,
      email: req.body.email ?? current.email,
      availability: req.body.availability ?? current.availability,
      rating: req.body.rating ?? current.rating,
      bio: req.body.bio ?? current.bio,
      status: req.body.status ?? current.status,
      working_hours: req.body.working_hours ?? current.working_hours,
    };

    const result = await query(
      `UPDATE doctors
       SET name=$1, specialization=$2, qualification=$3, experience=$4, phone=$5, email=$6, availability=$7, rating=$8, bio=$9, status=$10, working_hours=$11, updated_at=NOW()
       WHERE id=$12 RETURNING *`,
      [
        payload.name,
        payload.specialization,
        payload.qualification,
        payload.experience,
        payload.phone,
        payload.email,
        payload.availability,
        payload.rating,
        payload.bio,
        payload.status,
        payload.working_hours,
        id,
      ]
    );

    return res.json({ success: true, data: result.rows[0], message: "Doctor updated" });
  } catch (error) {
    console.error(error);
    return next(error);
  }
};

/**
 * Soft-delete a doctor by setting status to Inactive.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 * @returns {Promise<import('express').Response|void>}
 */
export const deleteDoctor = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await query(
      "UPDATE doctors SET status = 'Inactive', updated_at = NOW() WHERE id = $1 RETURNING *",
      [id]
    );
    if (!result.rows.length) {
      return res.status(404).json({ success: false, data: null, message: "Doctor not found" });
    }
    return res.json({ success: true, data: result.rows[0], message: "Doctor deactivated" });
  } catch (error) {
    console.error(error);
    return next(error);
  }
};
