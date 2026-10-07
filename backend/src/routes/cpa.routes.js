import express from "express";

import {
  startCpa,
  completeCpa,
  getCpaEvents,
} from "../controllers/cpa.controller.js";

import {
  protect,
} from "../middleware/auth.middleware.js";

const router =
  express.Router();

router.post(
  "/start",
  protect,
  startCpa
);

router.post(
  "/complete",
  protect,
  completeCpa
);

router.get(
  "/history",
  protect,
  getCpaEvents
);

export default router;