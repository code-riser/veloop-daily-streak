import express from "express";
import rateLimit from "express-rate-limit";
import { register, login, getMe, updateMe, googleLogin, demoLogin } from "../controllers/auth.controller.js";
import { registerValidator, loginValidator } from "../validators/auth.validator.js";
import { validate } from "../middleware/validation.middleware.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many authentication attempts. Please try again later." },
});

router.post("/register", authLimiter, registerValidator, validate, register);
router.post("/login", authLimiter, loginValidator, validate, login);
router.post("/google", authLimiter, googleLogin);
router.post("/demo", authLimiter, demoLogin);
router.get("/me", protect, getMe);
router.patch("/me", protect, updateMe);

export default router;
