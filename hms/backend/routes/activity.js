import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.js";
import { query } from "../config/db.js";

const router = Router();

router.get("/", authenticate, authorize(["admin"]), async (req, res, next) => {
  try {
    const { search, action, user_id, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    
    let whereClause = "WHERE 1=1";
    const params = [];
    let paramCount = 0;

    if (search) {
      paramCount++;
      whereClause += ` AND (al.action ILIKE $${paramCount} OR CAST(al.details AS TEXT) ILIKE $${paramCount} OR u.name ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }
    if (action) {
      paramCount++;
      whereClause += ` AND al.action = $${paramCount}`;
      params.push(action);
    }
    if (user_id) {
      paramCount++;
      whereClause += ` AND al.user_id = $${paramCount}`;
      params.push(user_id);
    }

    const countResult = await query(
      `SELECT COUNT(*) FROM audit_logs al LEFT JOIN users u ON al.user_id = u.id ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].count);

    const result = await query(
      `SELECT al.*, u.name as user_name, u.email as user_email, u.role as user_role 
       FROM audit_logs al 
       LEFT JOIN users u ON al.user_id = u.id 
       ${whereClause} 
       ORDER BY al.timestamp DESC 
       LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`,
      [...params, limit, offset]
    );

    res.json({
      success: true,
      data: {
        items: result.rows,
        pagination: { total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / limit) },
      },
    });
  } catch (error) {
    next(error);
  }
});

router.post("/", authenticate, async (req, res, next) => {
  try {
    const { action, entity_type, entity_id, details } = req.body;
    const userId = req.user?.id;
    const requestId = req.requestId || req.headers["x-request-id"];

    const result = await query(
      `INSERT INTO audit_logs (
         request_id, user_id, user_role, action, entity_type, entity_id,
         method, endpoint, ip_address, user_agent, response_status, success, details
       ) VALUES ($1, $2, $3, $4, $5, $6, 'POST', '/api/v1/activity', $7, $8, 201, true, $9)
       RETURNING *`,
      [
        requestId,
        userId,
        req.user?.role || null,
        action,
        entity_type,
        entity_id,
        req.ip,
        req.get("User-Agent") || null,
        JSON.stringify(details ?? {})
      ]
    );

    res.status(201).json({ success: true, data: result.rows[0], message: "Activity logged" });
  } catch (error) {
    next(error);
  }
});

export default router;
