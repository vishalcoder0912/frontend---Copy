import jwt from "jsonwebtoken";

export function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

    if (!token) {
      return res.status(401).json({ success: false, message: "Unauthorized", data: null });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Invalid token", data: null });
  }
}

export const authorize = (roles = []) => (req, res, next) => {
  if (!req.user || (roles.length && !roles.includes(req.user.role))) {
    return res.status(403).json({ success: false, message: "Forbidden", data: null });
  }
  next();
};
