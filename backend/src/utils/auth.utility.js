import jwt from "jsonwebtoken";
import crypto from "crypto";

export const createAccessToken = (user) => {
  return jwt.sign(
    { userId: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "15m" },
  );
};

export const hashRefreshToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};
