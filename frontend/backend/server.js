import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import { errorHandler } from "./middleware/errorHandler.js";
import patientRoutes from "./routes/patients.js";
import doctorRoutes from "./routes/doctors.js";
import appointmentRoutes from "./routes/appointments.js";
import billingRoutes from "./routes/billing.js";
import authRoutes from "./routes/auth.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ success: true, message: "Medicare HMS API" });
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/patients", patientRoutes);
app.use("/api/v1/doctors", doctorRoutes);
app.use("/api/v1/appointments", appointmentRoutes);
app.use("/api/v1/billing", billingRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
