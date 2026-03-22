import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { validate, schemas } from "../middleware/validate.js";
import {
  getAllBilling,
  getBillingById,
  createBilling,
  updateBilling,
  deleteBilling,
} from "../controllers/billingController.js";

const router = Router();

router.get("/", authenticate, getAllBilling);
router.get("/:id", authenticate, getBillingById);
router.post("/", authenticate, validate(schemas.billing), createBilling);
router.put("/:id", authenticate, validate(schemas.billing), updateBilling);
router.delete("/:id", authenticate, deleteBilling);

export default router;
