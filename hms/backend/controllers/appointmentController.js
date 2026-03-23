import { query } from "../config/db.js";

/**
 * Get all appointments with pagination and filters.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 * @returns {Promise<import('express').Response|void>}
 */
export const getAllAppointments = async (req, res, next) => {
  try {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 10);
    const search = req.query.search || "";
    const status = req.query.status || "";
    const doctorId = req.query.doctor_id || "";
    const date = req.query.date || "";
    const offset = (page - 1) * limit;

    const params = [];
    let where = "WHERE 1=1";

    if (search) {
      params.push(`%${search}%`);
      const idx = params.length;
      where += ` AND (p.name ILIKE $${idx} OR d.name ILIKE $${idx})`;
    }
    if (status) {
      params.push(status);
      where += ` AND a.status = $${params.length}`;
    }
    if (doctorId) {
      params.push(doctorId);
      where += ` AND a.doctor_id = $${params.length}`;
    }
    if (date) {
      params.push(date);
      where += ` AND DATE(a.appointment_date) = $${params.length}`;
    }

    params.push(limit, offset);

    const dataQuery = `
      SELECT
        a.id,
        a.patient_id,
        a.doctor_id,
        a.appointment_date,
        COALESCE(a.duration, 0) AS duration,
        COALESCE(a.type, '') AS type,
        COALESCE(a.status, 'Scheduled') AS status,
        COALESCE(a.notes, '') AS notes,
        COALESCE(a.symptoms, '') AS symptoms,
        COALESCE(a.prescription, '') AS prescription,
        a.follow_up_date,
        a.created_at,
        a.updated_at,
        COALESCE(p.name, '') AS patient_name,
        COALESCE(d.name, '') AS doctor_name
      FROM appointments a
      JOIN patients p ON a.patient_id = p.id
      JOIN doctors d ON a.doctor_id = d.id
      ${where}
      ORDER BY a.appointment_date DESC
      LIMIT $${params.length - 1} OFFSET $${params.length}
    `;

    const countQuery = `
      SELECT COUNT(*)
      FROM appointments a
      JOIN patients p ON a.patient_id = p.id
      JOIN doctors d ON a.doctor_id = d.id
      ${where}
    `;

    const [dataResult, countResult] = await Promise.all([
      query(dataQuery, params),
      query(countQuery, params.slice(0, params.length - 2)),
    ]);

    const total = Number(countResult.rows[0].count);

    return res.json({
      success: true,
      data: dataResult.rows,
      pagination: { total, page, limit, pages: Math.max(1, Math.ceil(total / limit)) },
      message: "Appointments fetched",
    });
  } catch (error) {
    console.error(error);
    return next(error);
  }
};

/**
 * Get an appointment by id.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 * @returns {Promise<import('express').Response|void>}
 */
export const getAppointmentById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await query(
      `SELECT
        a.id,
        a.patient_id,
        a.doctor_id,
        a.appointment_date,
        COALESCE(a.duration, 0) AS duration,
        COALESCE(a.type, '') AS type,
        COALESCE(a.status, 'Scheduled') AS status,
        COALESCE(a.notes, '') AS notes,
        COALESCE(a.symptoms, '') AS symptoms,
        COALESCE(a.prescription, '') AS prescription,
        a.follow_up_date,
        a.created_at,
        a.updated_at,
        COALESCE(p.name, '') AS patient_name,
        COALESCE(d.name, '') AS doctor_name
       FROM appointments a
       JOIN patients p ON a.patient_id = p.id
       JOIN doctors d ON a.doctor_id = d.id
       WHERE a.id = $1`,
      [id]
    );
    if (!result.rows.length) {
      return res.status(404).json({ success: false, data: null, message: "Appointment not found" });
    }
    return res.json({ success: true, data: result.rows[0], message: "Appointment fetched" });
  } catch (error) {
    console.error(error);
    return next(error);
  }
};

/**
 * Create an appointment.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 * @returns {Promise<import('express').Response|void>}
 */
export const createAppointment = async (req, res, next) => {
  try {
    const { patient_id, doctor_id, appointment_date, duration, type, status, notes, symptoms, prescription, follow_up_date } = req.body;
    const result = await query(
      `INSERT INTO appointments (patient_id, doctor_id, appointment_date, duration, type, status, notes, symptoms, prescription, follow_up_date)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [patient_id, doctor_id, appointment_date, duration, type, status || "Scheduled", notes, symptoms, prescription, follow_up_date]
    );
    return res.status(201).json({ success: true, data: result.rows[0], message: "Appointment created" });
  } catch (error) {
    console.error(error);
    return next(error);
  }
};

/**
 * Update an appointment.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 * @returns {Promise<import('express').Response|void>}
 */
export const updateAppointment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await query("SELECT * FROM appointments WHERE id = $1", [id]);
    if (!existing.rows.length) {
      return res.status(404).json({ success: false, data: null, message: "Appointment not found" });
    }

    const current = existing.rows[0];
    const payload = {
      patient_id: req.body.patient_id ?? current.patient_id,
      doctor_id: req.body.doctor_id ?? current.doctor_id,
      appointment_date: req.body.appointment_date ?? current.appointment_date,
      duration: req.body.duration ?? current.duration,
      type: req.body.type ?? current.type,
      status: req.body.status ?? current.status,
      notes: req.body.notes ?? current.notes,
      symptoms: req.body.symptoms ?? current.symptoms,
      prescription: req.body.prescription ?? current.prescription,
      follow_up_date: req.body.follow_up_date ?? current.follow_up_date,
    };

    const result = await query(
      `UPDATE appointments
       SET patient_id=$1, doctor_id=$2, appointment_date=$3, duration=$4, type=$5, status=$6, notes=$7, symptoms=$8, prescription=$9, follow_up_date=$10, updated_at=NOW()
       WHERE id=$11 RETURNING *`,
      [
        payload.patient_id,
        payload.doctor_id,
        payload.appointment_date,
        payload.duration,
        payload.type,
        payload.status,
        payload.notes,
        payload.symptoms,
        payload.prescription,
        payload.follow_up_date,
        id,
      ]
    );

    return res.json({ success: true, data: result.rows[0], message: "Appointment updated" });
  } catch (error) {
    console.error(error);
    return next(error);
  }
};

/**
 * Delete an appointment.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 * @returns {Promise<import('express').Response|void>}
 */
export const deleteAppointment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await query("DELETE FROM appointments WHERE id = $1 RETURNING *", [id]);
    if (!result.rows.length) {
      return res.status(404).json({ success: false, data: null, message: "Appointment not found" });
    }
    return res.json({ success: true, data: result.rows[0], message: "Appointment deleted" });
  } catch (error) {
    console.error(error);
    return next(error);
  }
};
