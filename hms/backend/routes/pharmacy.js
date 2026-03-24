import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.js";
import { validate, schemas } from "../middleware/validate.js";
import {
  createPharmacyItem,
  getAllPharmacyItems,
  updatePharmacyItem,
} from "../controllers/pharmacyController.js";

const router = Router();

router.get("/", authenticate, authorize(["admin", "pharmacist"]), getAllPharmacyItems);
router.post("/", authenticate, authorize(["admin", "pharmacist"]), validate(schemas.pharmacyCreate), createPharmacyItem);
router.put("/:id", authenticate, authorize(["admin", "pharmacist"]), validate(schemas.pharmacyUpdate), updatePharmacyItem);

export default router;
