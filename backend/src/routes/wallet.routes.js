import express from "express";

import {
  getWallet,
} from "../controllers/wallet.controller.js";

import {
  protect,
} from "../middleware/auth.middleware.js";

const router = express.Router();

router.get(
  "/",
  protect,
  getWallet
);

export default router;