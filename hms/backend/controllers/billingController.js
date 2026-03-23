import { query } from "../config/db.js";

/**
 * Get all billing records with pagination and filters.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 * @returns {Promise<import('express').Response|void>}
 */
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
      SELECT
        b.id,
        b.patient_id,
        b.doctor_id,
        b.appointment_id,
        COALESCE(b.amount, 0) AS amount,
        COALESCE(b.discount, 0) AS discount,
        COALESCE(b.tax, 0) AS tax,
        COALESCE(b.total, 0) AS total,
        COALESCE(b.status, 'Pending') AS status,
        COALESCE(b.payment_method, '') AS payment_method,
        b.invoice_date,
        b.due_date,
        b.paid_at,
        COALESCE(b.notes, '') AS notes,
        b.created_at,
        b.updated_at,
        COALESCE(p.name, '') AS patient_name,
        COALESCE(d.name, '') AS doctor_name
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

    const total = Number(countResult.rows[0].count);

    return res.json({
      success: true,
      data: dataResult.rows,
      pagination: { total, page, limit, pages: Math.max(1, Math.ceil(total / limit)) },
      message: "Billing records fetched",
    });
  } catch (error) {
    console.error(error);
    return next(error);
  }
};

/**
 * Get a billing record by id.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 * @returns {Promise<import('express').Response|void>}
 */
export const getBillingById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await query(
      `SELECT
        b.id,
        b.patient_id,
        b.doctor_id,
        b.appointment_id,
        COALESCE(b.amount, 0) AS amount,
        COALESCE(b.discount, 0) AS discount,
        COALESCE(b.tax, 0) AS tax,
        COALESCE(b.total, 0) AS total,
        COALESCE(b.status, 'Pending') AS status,
        COALESCE(b.payment_method, '') AS payment_method,
        b.invoice_date,
        b.due_date,
        b.paid_at,
        COALESCE(b.notes, '') AS notes,
        b.created_at,
        b.updated_at,
        COALESCE(p.name, '') AS patient_name,
        COALESCE(d.name, '') AS doctor_name
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
    console.error(error);
    return next(error);
  }
};

/**
 * Create a billing record.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 * @returns {Promise<import('express').Response|void>}
 */
export const createBilling = async (req, res, next) => {
  try {
    const { patient_id, doctor_id, appointment_id, amount, discount, tax, total, status, payment_method, due_date, paid_at, notes } = req.body;
    const computedTotal = total ?? Number(amount || 0) - Number(discount || 0) + Number(tax || 0);
    const result = await query(
      `INSERT INTO billing (patient_id, doctor_id, appointment_id, amount, discount, tax, total, status, payment_method, due_date, paid_at, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,
      [
        patient_id,
        doctor_id,
        appointment_id,
        amount,
        discount || 0,
        tax || 0,
        computedTotal,
        status || "Pending",
        payment_method,
        due_date,
        paid_at,
        notes,
      ]
    );
    return res.status(201).json({ success: true, data: result.rows[0], message: "Billing record created" });
  } catch (error) {
    console.error(error);
    return next(error);
  }
};

/**
 * Update a billing record.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 * @returns {Promise<import('express').Response|void>}
 */
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
      discount: req.body.discount ?? current.discount,
      tax: req.body.tax ?? current.tax,
      total: req.body.total ?? current.total,
      status: req.body.status ?? current.status,
      payment_method: req.body.payment_method ?? current.payment_method,
      due_date: req.body.due_date ?? current.due_date,
      paid_at: req.body.paid_at ?? current.paid_at,
      notes: req.body.notes ?? current.notes,
    };

    const computedTotal = payload.total ?? Number(payload.amount || 0) - Number(payload.discount || 0) + Number(payload.tax || 0);

    const result = await query(
      `UPDATE billing
       SET patient_id=$1, doctor_id=$2, appointment_id=$3, amount=$4, discount=$5, tax=$6, total=$7, status=$8, payment_method=$9, due_date=$10, paid_at=$11, notes=$12, updated_at=NOW()
       WHERE id=$13 RETURNING *`,
      [
        payload.patient_id,
        payload.doctor_id,
        payload.appointment_id,
        payload.amount,
        payload.discount,
        payload.tax,
        computedTotal,
        payload.status,
        payload.payment_method,
        payload.due_date,
        payload.paid_at,
        payload.notes,
        id,
      ]
    );

    return res.json({ success: true, data: result.rows[0], message: "Billing record updated" });
  } catch (error) {
    console.error(error);
    return next(error);
  }
};

/**
 * Delete a billing record.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 * @returns {Promise<import('express').Response|void>}
 */
export const deleteBilling = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await query("DELETE FROM billing WHERE id = $1 RETURNING *", [id]);
    if (!result.rows.length) {
      return res.status(404).json({ success: false, data: null, message: "Billing record not found" });
    }
    return res.json({ success: true, data: result.rows[0], message: "Billing record deleted" });
  } catch (error) {
    console.error(error);
    return next(error);
  }
};
