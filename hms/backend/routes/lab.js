import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.js";
import { validate, schemas } from "../middleware/validate.js";
import { createLabOrder, getAllLabOrders, updateLabOrder } from "../controllers/labController.js";

const router = Router();

router.get("/", authenticate, authorize(["admin", "doctor", "nurse", "lab_technician"]), getAllLabOrders);
router.post("/", authenticate, authorize(["admin", "doctor", "nurse", "lab_technician"]), validate(schemas.labCreate), createLabOrder);
router.put("/:id", authenticate, authorize(["admin", "doctor", "nurse", "lab_technician"]), validate(schemas.labUpdate), updateLabOrder);

export default router;
