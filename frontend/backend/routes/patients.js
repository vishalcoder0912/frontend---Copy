import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { validate, schemas } from "../middleware/validate.js";
import {
  getAllPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient,
} from "../controllers/patientController.js";

const router = Router();

router.get("/", authenticate, getAllPatients);
router.get("/:id", authenticate, getPatientById);
router.post("/", authenticate, validate(schemas.patient), createPatient);
router.put("/:id", authenticate, validate(schemas.patient), updatePatient);
router.delete("/:id", authenticate, deletePatient);

export default router;
