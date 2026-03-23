import Joi from "joi";

/**
 * Validate request body against a Joi schema.
 * @param {Joi.ObjectSchema} schema
 * @returns {(req: import('express').Request, res: import('express').Response, next: import('express').NextFunction) => void}
 */
export const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
  if (error) {
    const message = error.details.map((detail) => detail.message).join(", ");
    return res.status(400).json({ success: false, data: null, message });
  }
  return next();
};

/**
 * Joi schemas for request validation.
 */
export const schemas = {
  register: Joi.object({
    name: Joi.string().min(2).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    role: Joi.string().optional(),
  }),
  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),
  patientCreate: Joi.object({
    name: Joi.string().min(2).required(),
    age: Joi.number().min(0).max(130).optional(),
    gender: Joi.string().optional(),
    blood_type: Joi.string().optional(),
    phone: Joi.string().optional(),
    email: Joi.string().email().optional(),
    address: Joi.string().optional(),
    medical_history: Joi.string().optional(),
    status: Joi.string().optional(),
  }),
  patientUpdate: Joi.object({
    name: Joi.string().min(2).optional(),
    age: Joi.number().min(0).max(130).optional(),
    gender: Joi.string().optional(),
    blood_type: Joi.string().optional(),
    phone: Joi.string().optional(),
    email: Joi.string().email().optional(),
    address: Joi.string().optional(),
    medical_history: Joi.string().optional(),
    status: Joi.string().optional(),
  }),
  doctorCreate: Joi.object({
    name: Joi.string().min(2).required(),
    specialization: Joi.string().optional(),
    qualification: Joi.string().optional(),
    experience: Joi.number().min(0).optional(),
    phone: Joi.string().optional(),
    email: Joi.string().email().optional(),
    availability: Joi.string().optional(),
    rating: Joi.number().min(0).max(5).optional(),
    bio: Joi.string().optional(),
    status: Joi.string().optional(),
    working_hours: Joi.object().optional(),
  }),
  doctorUpdate: Joi.object({
    name: Joi.string().min(2).optional(),
    specialization: Joi.string().optional(),
    qualification: Joi.string().optional(),
    experience: Joi.number().min(0).optional(),
    phone: Joi.string().optional(),
    email: Joi.string().email().optional(),
    availability: Joi.string().optional(),
    rating: Joi.number().min(0).max(5).optional(),
    bio: Joi.string().optional(),
    status: Joi.string().optional(),
    working_hours: Joi.object().optional(),
  }),
  appointmentCreate: Joi.object({
    patient_id: Joi.number().required(),
    doctor_id: Joi.number().required(),
    appointment_date: Joi.date().required(),
    duration: Joi.number().optional(),
    type: Joi.string().optional(),
    status: Joi.string().optional(),
    notes: Joi.string().optional(),
    symptoms: Joi.string().optional(),
    prescription: Joi.string().optional(),
    follow_up_date: Joi.date().optional(),
  }),
  appointmentUpdate: Joi.object({
    patient_id: Joi.number().optional(),
    doctor_id: Joi.number().optional(),
    appointment_date: Joi.date().optional(),
    duration: Joi.number().optional(),
    type: Joi.string().optional(),
    status: Joi.string().optional(),
    notes: Joi.string().optional(),
    symptoms: Joi.string().optional(),
    prescription: Joi.string().optional(),
    follow_up_date: Joi.date().optional(),
  }),
  billingCreate: Joi.object({
    patient_id: Joi.number().required(),
    doctor_id: Joi.number().required(),
    appointment_id: Joi.number().optional(),
    amount: Joi.number().required(),
    discount: Joi.number().optional(),
    tax: Joi.number().optional(),
    total: Joi.number().optional(),
    status: Joi.string().optional(),
    payment_method: Joi.string().optional(),
    due_date: Joi.date().optional(),
    paid_at: Joi.date().optional(),
    notes: Joi.string().optional(),
  }),
  billingUpdate: Joi.object({
    patient_id: Joi.number().optional(),
    doctor_id: Joi.number().optional(),
    appointment_id: Joi.number().optional(),
    amount: Joi.number().optional(),
    discount: Joi.number().optional(),
    tax: Joi.number().optional(),
    total: Joi.number().optional(),
    status: Joi.string().optional(),
    payment_method: Joi.string().optional(),
    due_date: Joi.date().optional(),
    paid_at: Joi.date().optional(),
    notes: Joi.string().optional(),
  }),
};
