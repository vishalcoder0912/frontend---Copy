import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.js";
import { validate, schemas } from "../middleware/validate.js";
import {
  getAllPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient,
} from "../controllers/patientController.js";

const router = Router();

router.get("/", authenticate, authorize(["admin", "staff", "doctor", "nurse", "receptionist", "billing", "lab_technician", "pharmacist"]), getAllPatients);
router.get("/:id", authenticate, authorize(["admin", "staff", "doctor", "nurse", "receptionist", "billing", "lab_technician", "pharmacist"]), getPatientById);
router.post("/", authenticate, authorize(["admin", "staff", "nurse", "receptionist"]), validate(schemas.patientCreate), createPatient);
router.put("/:id", authenticate, authorize(["admin", "staff", "nurse", "receptionist"]), validate(schemas.patientUpdate), updatePatient);
router.delete("/:id", authenticate, authorize(["admin", "staff", "receptionist"]), deletePatient);

export default router;
