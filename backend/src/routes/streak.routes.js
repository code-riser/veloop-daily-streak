import express from "express";
import rateLimit from "express-rate-limit";

import {
  getDailyStreak,
  claimReward,
  getDailyStreakHistory,
} from "../controllers/streak.controller.js";

import {
  protect,
} from "../middleware/auth.middleware.js";

const router =
  express.Router();

const claimLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many claim attempts. Please wait." },
});

router.get(
  "/status",
  protect,
  getDailyStreak
);

router.get(
  "/",
  protect,
  getDailyStreak
);

router.get(
  "/history",
  protect,
  getDailyStreakHistory
);

router.post(
  "/claim",
  protect,
  claimLimiter,
  claimReward
);

export default router;