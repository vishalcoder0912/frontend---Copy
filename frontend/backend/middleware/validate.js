import Joi from "joi";

export const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false, allowUnknown: true });
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details.map((detail) => detail.message).join(", "),
      data: null,
    });
  }
  next();
};

export const schemas = {
  patient: Joi.object({
    name: Joi.string().min(2).required(),
    age: Joi.number().integer().min(0).optional(),
    gender: Joi.string().optional(),
    blood_type: Joi.string().optional(),
    phone: Joi.string().optional(),
    email: Joi.string().email().optional(),
    address: Joi.string().optional(),
    medical_history: Joi.string().optional(),
    status: Joi.string().optional(),
  }),
  doctor: Joi.object({
    name: Joi.string().min(2).required(),
    specialization: Joi.string().optional(),
    experience: Joi.number().integer().min(0).optional(),
    phone: Joi.string().optional(),
    email: Joi.string().email().optional(),
    availability: Joi.string().optional(),
    rating: Joi.number().precision(1).optional(),
  }),
  appointment: Joi.object({
    patient_id: Joi.number().integer().required(),
    doctor_id: Joi.number().integer().required(),
    appointment_date: Joi.date().required(),
    type: Joi.string().optional(),
    status: Joi.string().optional(),
    notes: Joi.string().optional(),
  }),
  billing: Joi.object({
    patient_id: Joi.number().integer().required(),
    doctor_id: Joi.number().integer().required(),
    appointment_id: Joi.number().integer().optional(),
    amount: Joi.number().precision(2).required(),
    status: Joi.string().optional(),
    invoice_date: Joi.date().optional(),
    due_date: Joi.date().optional(),
    paid_at: Joi.date().optional(),
  }),
  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
  }),
  register: Joi.object({
    name: Joi.string().min(2).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    role: Joi.string().optional(),
  }),
};
