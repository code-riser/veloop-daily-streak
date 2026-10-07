import express from "express";

import {
  getAdminConfig,
  updateAdminConfig,
  getAllRewards,
  createReward,
  updateReward,
  deleteReward,
} from "../controllers/admin.controller.js";

import { protect } from "../middleware/auth.middleware.js";
import { adminOnly } from "../middleware/admin.middleware.js";

const router = express.Router();

// ==========================================
// 📊 Admin Dashboard
// ==========================================

router.get("/dashboard", protect, adminOnly, (req, res) => {
  res.json({
    success: true,
    message: "Admin API working",
  });
});

// ==========================================
// ⚙️ Admin Config
// ==========================================

router.get("/config", protect, adminOnly, getAdminConfig);
router.put("/config", protect, adminOnly, updateAdminConfig);

// ==========================================
// 🎁 Reward Management
// ==========================================

// Get all rewards
router.get(
  "/rewards",
  protect,
  adminOnly,
  getAllRewards
);

// Create reward
router.post(
  "/rewards",
  protect,
  adminOnly,
  createReward
);

// Update reward
router.put(
  "/rewards/:id",
  protect,
  adminOnly,
  updateReward
);

// Delete reward
router.delete(
  "/rewards/:id",
  protect,
  adminOnly,
  deleteReward
);

export default router;