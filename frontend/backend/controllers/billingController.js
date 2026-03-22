import { query } from "../config/db.js";

export const getAllBilling = async (req, res, next) => {
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
      where += ` AND (p.name ILIKE $${idx} OR d.name ILIKE $${idx})`;
    }
    if (status) {
      params.push(status);
      where += ` AND b.status = $${params.length}`;
    }

    params.push(limit, offset);

    const dataQuery = `
      SELECT b.*, p.name AS patient_name, d.name AS doctor_name
      FROM billing b
      JOIN patients p ON b.patient_id = p.id
      JOIN doctors d ON b.doctor_id = d.id
      ${where}
      ORDER BY b.invoice_date DESC
      LIMIT $${params.length - 1} OFFSET $${params.length}
    `;

    const countQuery = `
      SELECT COUNT(*)
      FROM billing b
      JOIN patients p ON b.patient_id = p.id
      JOIN doctors d ON b.doctor_id = d.id
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
      message: "Billing records fetched",
    });
  } catch (error) {
    next(error);
  }
};

export const getBillingById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await query(
      `SELECT b.*, p.name AS patient_name, d.name AS doctor_name
       FROM billing b
       JOIN patients p ON b.patient_id = p.id
       JOIN doctors d ON b.doctor_id = d.id
       WHERE b.id = $1`,
      [id]
    );
    if (!result.rows.length) {
      return res.status(404).json({ success: false, data: null, message: "Billing record not found" });
    }
    return res.json({ success: true, data: result.rows[0], message: "Billing record fetched" });
  } catch (error) {
    next(error);
  }
};

export const createBilling = async (req, res, next) => {
  try {
    const { patient_id, doctor_id, appointment_id, amount, status, invoice_date, due_date, paid_at } = req.body;
    const result = await query(
      `INSERT INTO billing (patient_id, doctor_id, appointment_id, amount, status, invoice_date, due_date, paid_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [patient_id, doctor_id, appointment_id, amount, status || "Pending", invoice_date, due_date, paid_at]
    );
    return res.status(201).json({ success: true, data: result.rows[0], message: "Billing record created" });
  } catch (error) {
    next(error);
  }
};

export const updateBilling = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await query("SELECT * FROM billing WHERE id = $1", [id]);
    if (!existing.rows.length) {
      return res.status(404).json({ success: false, data: null, message: "Billing record not found" });
    }

    const current = existing.rows[0];
    const payload = {
      patient_id: req.body.patient_id ?? current.patient_id,
      doctor_id: req.body.doctor_id ?? current.doctor_id,
      appointment_id: req.body.appointment_id ?? current.appointment_id,
      amount: req.body.amount ?? current.amount,
      status: req.body.status ?? current.status,
      invoice_date: req.body.invoice_date ?? current.invoice_date,
      due_date: req.body.due_date ?? current.due_date,
      paid_at: req.body.paid_at ?? current.paid_at,
    };

    const result = await query(
      `UPDATE billing
       SET patient_id=$1, doctor_id=$2, appointment_id=$3, amount=$4, status=$5, invoice_date=$6, due_date=$7, paid_at=$8
       WHERE id=$9 RETURNING *`,
      [
        payload.patient_id,
        payload.doctor_id,
        payload.appointment_id,
        payload.amount,
        payload.status,
        payload.invoice_date,
        payload.due_date,
        payload.paid_at,
        id,
      ]
    );

    return res.json({ success: true, data: result.rows[0], message: "Billing record updated" });
  } catch (error) {
    next(error);
  }
};

export const deleteBilling = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await query("DELETE FROM billing WHERE id = $1 RETURNING *", [id]);
    if (!result.rows.length) {
      return res.status(404).json({ success: false, data: null, message: "Billing record not found" });
    }
    return res.json({ success: true, data: result.rows[0], message: "Billing record deleted" });
  } catch (error) {
    next(error);
  }
};
