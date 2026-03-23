import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { validate, schemas } from "../middleware/validate.js";
import {
  getAllDoctors,
  getDoctorById,
  createDoctor,
  updateDoctor,
  deleteDoctor,
} from "../controllers/doctorController.js";

const router = Router();

router.get("/", authenticate, getAllDoctors);
router.get("/:id", authenticate, getDoctorById);
router.post("/", authenticate, validate(schemas.doctor), createDoctor);
router.put("/:id", authenticate, validate(schemas.doctor), updateDoctor);
router.delete("/:id", authenticate, deleteDoctor);

export default router;
