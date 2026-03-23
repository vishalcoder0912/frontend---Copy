export const STATUS = {
  patient: ["Active", "Critical", "Discharged"],
  doctor: ["Available", "In Surgery", "On Leave"],
  appointment: ["Scheduled", "Completed", "Cancelled"],
  billing: ["Paid", "Pending", "Overdue"],
};

export const BADGE_VARIANTS = {
  Active: "success",
  Critical: "danger",
  Discharged: "default",
  Available: "success",
  "In Surgery": "warning",
  "On Leave": "danger",
  Scheduled: "info",
  Completed: "success",
  Cancelled: "danger",
  Paid: "success",
  Pending: "warning",
  Overdue: "danger",
};

export const THEME = {
  primary: "#0ea5e9",
  success: "#10b981",
  warning: "#f59e0b",
  danger: "#f43f5e",
  neutral: "#0f172a",
};

export const PAGE_SIZES = [10, 20, 50];
