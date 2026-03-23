import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { validate, schemas } from "../middleware/validate.js";
import {
  getAllAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  deleteAppointment,
} from "../controllers/appointmentController.js";

const router = Router();

router.get("/", authenticate, getAllAppointments);
router.get("/:id", authenticate, getAppointmentById);
router.post("/", authenticate, validate(schemas.appointment), createAppointment);
router.put("/:id", authenticate, validate(schemas.appointment), updateAppointment);
router.delete("/:id", authenticate, deleteAppointment);

export default router;
