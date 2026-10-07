import jwt from "jsonwebtoken";

const getJwtSecret = () => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }

  return process.env.JWT_SECRET;
};

export const generateToken = (userId) => {
  return jwt.sign(
    {
      userId: userId.toString(),
    },
    getJwtSecret(),
    {
      expiresIn: "7d",
    }
  );
};

export const verifyToken = (token) => {
  return jwt.verify(token, getJwtSecret());
};