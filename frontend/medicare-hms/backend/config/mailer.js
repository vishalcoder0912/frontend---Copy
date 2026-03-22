import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT || 587),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendEmail = async (to, subject, html) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
    });
  } catch (error) {
    console.error("Email send error:", error.message);
  }
};

export const templates = {
  welcome: (name) => `
    <h2>Welcome to Medicare HMS</h2>
    <p>Hello ${name}, your account is ready.</p>
  `,
  appointmentConfirmation: (details) => `
    <h2>Appointment Confirmed</h2>
    <p>${details}</p>
  `,
  appointmentReminder: (details) => `
    <h2>Appointment Reminder</h2>
    <p>${details}</p>
  `,
  passwordReset: (link) => `
    <h2>Password Reset</h2>
    <p>Click to reset: <a href="${link}">${link}</a></p>
  `,
  invoiceGenerated: (details) => `
    <h2>Invoice Generated</h2>
    <p>${details}</p>
  `,
};
