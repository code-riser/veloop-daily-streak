import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";

import authRoutes from "./routes/auth.routes.js";
import streakRoutes from "./routes/streak.routes.js";
import adminRoutes from "./routes/admin.route.js";
import walletRoutes from "./routes/wallet.routes.js";
import transactionRoutes from "./routes/transaction.routes.js";
import cpaRoutes from "./routes/cpa.routes.js";

const app = express();

app.set("trust proxy", 1);

app.use(helmet({ crossOriginResourcePolicy: false }));
const configuredOrigins = (process.env.FRONTEND_URLS || process.env.FRONTEND_URL || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const allowedOrigins = new Set([
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  ...configuredOrigins,
]);

app.use(cors({
  origin(origin, callback) {
    // Non-browser requests (curl/Postman/server-to-server) have no Origin.
    if (!origin) return callback(null, true);
    if (allowedOrigins.has(origin)) return callback(null, true);
    return callback(new Error("CORS origin not allowed."));
  },
  credentials: true,
}));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== "test") app.use(morgan("dev"));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests. Please try again later." },
});
app.use("/api", apiLimiter);

app.get("/", (req, res) => res.json({
  success: true,
  message: "VELOOP Daily Streak API Running",
  environment: process.env.NODE_ENV || "development",
}));

app.get("/api/health", (req, res) => res.json({
  success: true,
  service: "veloop-daily-streak-api",
  serverTime: new Date().toISOString(),
}));

app.use("/api/auth", authRoutes);
app.use("/api/daily-streak", streakRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/cpa", cpaRoutes);

app.use((req, res) => res.status(404).json({
  success: false,
  message: "API endpoint not found.",
}));

app.use((error, req, res, next) => {
  console.error("Unhandled server error:", error);
  res.status(500).json({
    success: false,
    message: "Something went wrong on the server.",
  });
});

export default app;
