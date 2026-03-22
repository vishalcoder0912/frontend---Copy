import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { query } from "../config/db.js";

export const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    const existing = await query("SELECT id FROM users WHERE email = $1", [email]);
    if (existing.rows.length) {
      return res.status(409).json({ success: false, data: null, message: "Email already registered" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const result = await query(
      "INSERT INTO users (name, email, password_hash, role) VALUES ($1,$2,$3,$4) RETURNING id, name, email, role",
      [name, email, passwordHash, role || "staff"]
    );

    const token = jwt.sign({ id: result.rows[0].id, role: result.rows[0].role }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    return res.status(201).json({
      success: true,
      data: { user: result.rows[0], token },
      message: "User registered",
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await query("SELECT * FROM users WHERE email = $1", [email]);
    if (!result.rows.length) {
      return res.status(401).json({ success: false, data: null, message: "Invalid credentials" });
    }

    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ success: false, data: null, message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    return res.json({
      success: true,
      data: { user: { id: user.id, name: user.name, email: user.email, role: user.role }, token },
      message: "Login successful",
    });
  } catch (error) {
    next(error);
  }
};
