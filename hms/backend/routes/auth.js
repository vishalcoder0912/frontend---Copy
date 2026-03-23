import { Router } from "express";
import { validate, schemas } from "../middleware/validate.js";
import { login, register } from "../controllers/authController.js";

const router = Router();

router.post("/register", validate(schemas.register), register);
router.post("/login", validate(schemas.login), login);

export default router;
