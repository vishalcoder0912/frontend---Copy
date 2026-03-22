import { query } from "../config/db.js";

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
      SELECT a.*, p.name AS patient_name, d.name AS doctor_name
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

    return res.json({
      success: true,
      data: {
        items: dataResult.rows,
        total: Number(countResult.rows[0].count),
        page,
        limit,
      },
      message: "Appointments fetched",
    });
  } catch (error) {
    next(error);
  }
};

export const getAppointmentById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await query(
      `SELECT a.*, p.name AS patient_name, d.name AS doctor_name
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
    next(error);
  }
};

export const createAppointment = async (req, res, next) => {
  try {
    const { patient_id, doctor_id, appointment_date, type, status, notes } = req.body;
    const result = await query(
      `INSERT INTO appointments (patient_id, doctor_id, appointment_date, type, status, notes)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [patient_id, doctor_id, appointment_date, type, status || "Scheduled", notes]
    );
    return res.status(201).json({ success: true, data: result.rows[0], message: "Appointment created" });
  } catch (error) {
    next(error);
  }
};

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
      type: req.body.type ?? current.type,
      status: req.body.status ?? current.status,
      notes: req.body.notes ?? current.notes,
    };

    const result = await query(
      `UPDATE appointments
       SET patient_id=$1, doctor_id=$2, appointment_date=$3, type=$4, status=$5, notes=$6
       WHERE id=$7 RETURNING *`,
      [
        payload.patient_id,
        payload.doctor_id,
        payload.appointment_date,
        payload.type,
        payload.status,
        payload.notes,
        id,
      ]
    );

    return res.json({ success: true, data: result.rows[0], message: "Appointment updated" });
  } catch (error) {
    next(error);
  }
};

export const deleteAppointment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await query("DELETE FROM appointments WHERE id = $1 RETURNING *", [id]);
    if (!result.rows.length) {
      return res.status(404).json({ success: false, data: null, message: "Appointment not found" });
    }
    return res.json({ success: true, data: result.rows[0], message: "Appointment deleted" });
  } catch (error) {
    next(error);
  }
};
