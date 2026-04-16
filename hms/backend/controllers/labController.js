import { query } from "../config/db.js";
import { 
  detectTestCategory, 
  analyzeLabData, 
  parseLabReport, 
  categorizeFile,
  LAB_TEST_CATEGORIES,
  PRIORITY_LEVELS,
  SPECIMEN_TYPES
} from "../services/labAnalysis.js";

const labSelect = `
  SELECT
    l.id,
    l.patient_id,
    l.doctor_id,
    l.test_name,
    COALESCE(l.result, '') AS result,
    l.file_urls,
    l.analyzed_data,
    l.test_category,
    l.priority,
    l.specimen_type,
    l.specimen_id,
    COALESCE(l.status, 'Pending') AS status,
    l.ordered_at,
    l.updated_at,
    COALESCE(p.name, '') AS patient_name,
    COALESCE(d.name, '') AS doctor_name
  FROM lab_orders l
  JOIN patients p ON p.id = l.patient_id
  JOIN doctors d ON d.id = l.doctor_id
  WHERE l.is_deleted = false
`;

export const getAllLabOrders = async (req, res, next) => {
  try {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 10);
    const search = req.query.search || "";
    const status = req.query.status || "";
    const category = req.query.category || "";
    const offset = (page - 1) * limit;
    const params = [];
    let where = "AND 1=1";
    let countWhere = "WHERE 1=1";

    if (search) {
      params.push(`%${search}%`);
      const idx = params.length;
      where += ` AND (p.name ILIKE $${idx} OR d.name ILIKE $${idx} OR l.test_name ILIKE $${idx})`;
      countWhere += ` AND (p.name ILIKE $${idx} OR d.name ILIKE $${idx} OR l.test_name ILIKE $${idx})`;
    }
    if (status) {
      params.push(status);
      where += ` AND l.status = $${params.length}`;
      countWhere += ` AND l.status = $${params.length}`;
    }
    if (category) {
      params.push(category);
      where += ` AND l.test_category = $${params.length}`;
      countWhere += ` AND l.test_category = $${params.length}`;
    }

    params.push(limit, offset);

    const [itemsResult, countResult] = await Promise.all([
      query(
        `${labSelect} ${where} ORDER BY l.ordered_at DESC, l.id DESC LIMIT $${params.length - 1} OFFSET $${params.length}`,
        params
      ),
      query(
        `SELECT COUNT(*) FROM lab_orders l JOIN patients p ON p.id = l.patient_id JOIN doctors d ON d.id = l.doctor_id ${countWhere}`,
        params.slice(0, -2)
      ),
    ]);

    const total = Number(countResult.rows[0].count);
    return res.json({
      success: true,
      data: {
        items: itemsResult.rows,
        pagination: { total, page, limit, totalPages: Math.max(1, Math.ceil(total / limit)) },
      },
      message: "Lab orders fetched",
    });
  } catch (error) {
    return next(error);
  }
};

export const createLabOrder = async (req, res, next) => {
  try {
    const { 
      patient_id, 
      doctor_id, 
      test_name, 
      result, 
      status,
      priority,
      specimen_type,
      test_category 
    } = req.body;

    const detected = detectTestCategory(test_name);
    const finalCategory = test_category || detected.category;
    
    const specimenId = `LAB-${Date.now().toString(36).toUpperCase()}`;

    const created = await query(
      `INSERT INTO lab_orders (patient_id, doctor_id, test_name, result, status, priority, specimen_type, specimen_id, test_category, file_urls, analyzed_data)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, '[]'::jsonb, '{}'::jsonb)
       RETURNING id`,
      [
        patient_id, 
        doctor_id, 
        test_name, 
        result || null, 
        status || "Pending",
        priority || "Routine",
        specimen_type || SPECIMEN_TYPES.BLOOD,
        specimenId,
        finalCategory
      ]
    );

    const resultRow = await query(`${labSelect} AND l.id = $1`, [created.rows[0].id]);
    return res.status(201).json({
      success: true,
      data: resultRow.rows[0],
      message: "Lab order created",
    });
  } catch (error) {
    return next(error);
  }
};

export const updateLabOrder = async (req, res, next) => {
  try {
    const existing = await query("SELECT * FROM lab_orders WHERE id = $1 AND is_deleted = false", [req.params.id]);
    if (!existing.rows.length) {
      return res.status(404).json({ success: false, data: null, message: "Lab order not found" });
    }

    const current = existing.rows[0];
    const { 
      patient_id, 
      doctor_id, 
      test_name, 
      result, 
      status,
      priority,
      specimen_type,
      test_category,
      analyzed_data
    } = req.body;

    let finalAnalyzedData = current.analyzed_data || {};
    if (result && !analyzed_data) {
      const analysis = analyzeLabData(test_name || current.test_name, result);
      finalAnalyzedData = analysis;
    }

    const payload = {
      patient_id: patient_id ?? current.patient_id,
      doctor_id: doctor_id ?? current.doctor_id,
      test_name: test_name ?? current.test_name,
      result: result ?? current.result,
      status: status ?? current.status,
      priority: priority ?? current.priority,
      specimen_type: specimen_type ?? current.specimen_type,
      test_category: test_category ?? current.test_category,
      analyzed_data: JSON.stringify(finalAnalyzedData),
    };

    await query(
      `UPDATE lab_orders
       SET patient_id = $1, doctor_id = $2, test_name = $3, result = $4, status = $5, 
           priority = $6, specimen_type = $7, test_category = $8, analyzed_data = $9, updated_at = NOW()
       WHERE id = $10 AND is_deleted = false`,
      [
        payload.patient_id, 
        payload.doctor_id, 
        payload.test_name, 
        payload.result, 
        payload.status,
        payload.priority,
        payload.specimen_type,
        payload.test_category,
        payload.analyzed_data,
        req.params.id
      ]
    );

    const resultRow = await query(`${labSelect} AND l.id = $1`, [req.params.id]);
    return res.json({ success: true, data: resultRow.rows[0], message: "Lab order updated" });
  } catch (error) {
    return next(error);
  }
};

export const uploadLabReport = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await query("SELECT * FROM lab_orders WHERE id = $1 AND is_deleted = false", [id]);

    if (!existing.rows.length) {
      return res.status(404).json({ success: false, data: null, message: "Lab order not found" });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, data: null, message: "No files uploaded" });
    }

    const currentOrder = existing.rows[0];
    const currentUrls = currentOrder.file_urls || [];
    
    const newUrls = req.files.map(file => ({
      url: `/uploads/lab-reports/${file.filename}`,
      filename: file.originalname,
      type: categorizeFile(file.originalname),
      size: file.size,
      uploadedAt: new Date().toISOString(),
    }));

    const allUrls = [...currentUrls, ...newUrls];

    let analyzedData = currentOrder.analyzed_data || {};
    
    const textFile = req.files.find(f => 
      f.mimetype === "text/plain" || 
      f.originalname.endsWith(".txt") ||
      f.originalname.endsWith(".csv")
    );

    if (textFile) {
      const fs = await import("fs");
      const path = await import("path");
      const filePath = path.join(process.cwd(), "uploads", "lab-reports", textFile.filename);
      const fileContent = fs.readFileSync(filePath, "utf-8");
      
      const analysis = parseLabReport(fileContent, currentOrder.test_name);
      analyzedData = {
        ...analysis.analysis,
        analyzedFiles: newUrls.map(f => f.filename),
        recommendations: analysis.recommendations,
      };
    }

    await query(
      `UPDATE lab_orders 
       SET file_urls = $1, analyzed_data = $2, status = 'Completed', updated_at = NOW() 
       WHERE id = $3`,
      [JSON.stringify(allUrls), JSON.stringify(analyzedData), id]
    );

    const resultRow = await query(`${labSelect} AND l.id = $1`, [id]);
    return res.json({ 
      success: true, 
      data: { 
        ...resultRow.rows[0], 
        file_urls: allUrls,
        analyzed_data: analyzedData 
      }, 
      message: "Lab reports uploaded and analyzed" 
    });
  } catch (error) {
    return next(error);
  }
};

export const deleteLabFile = async (req, res, next) => {
  try {
    const { id, fileIndex } = req.params;
    const existing = await query("SELECT * FROM lab_orders WHERE id = $1 AND is_deleted = false", [id]);

    if (!existing.rows.length) {
      return res.status(404).json({ success: false, data: null, message: "Lab order not found" });
    }

    const currentOrder = existing.rows[0];
    const currentUrls = currentOrder.file_urls || [];
    
    if (fileIndex < 0 || fileIndex >= currentUrls.length) {
      return res.status(400).json({ success: false, data: null, message: "File not found" });
    }

    const removedFile = currentUrls.splice(fileIndex, 1)[0];
    
    const fs = await import("fs");
    const path = await import("path");
    const filePath = path.join(process.cwd(), removedFile.url.replace("/uploads", "uploads"));
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await query(
      `UPDATE lab_orders SET file_urls = $1, updated_at = NOW() WHERE id = $2`,
      [JSON.stringify(currentUrls), id]
    );

    const resultRow = await query(`${labSelect} AND l.id = $1`, [id]);
    return res.json({ success: true, data: resultRow.rows[0], message: "File deleted" });
  } catch (error) {
    return next(error);
  }
};

export const analyzeLabResult = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { result } = req.body;

    const existing = await query("SELECT * FROM lab_orders WHERE id = $1 AND is_deleted = false", [id]);

    if (!existing.rows.length) {
      return res.status(404).json({ success: false, data: null, message: "Lab order not found" });
    }

    const currentOrder = existing.rows[0];
    const analysis = parseLabReport(result, currentOrder.test_name);

    await query(
      `UPDATE lab_orders 
       SET result = $1, analyzed_data = $2, status = 'Completed', updated_at = NOW() 
       WHERE id = $3`,
      [result, JSON.stringify(analysis.analysis), id]
    );

    const resultRow = await query(`${labSelect} AND l.id = $1`, [id]);
    return res.json({ 
      success: true, 
      data: { 
        ...resultRow.rows[0],
        analysis: analysis.analysis,
        recommendations: analysis.recommendations
      }, 
      message: "Lab result analyzed" 
    });
  } catch (error) {
    return next(error);
  }
};
