import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    event: {
      type: String,
      enum: [
        "STREAK_CLAIM_REQUEST",
        "STREAK_CLAIM_SUCCESS",
        "STREAK_CLAIM_REJECTED",
        "STREAK_RESET",
        "DUPLICATE_CLAIM",
        "INVALID_CLAIM",
      ],
      required: true,
      index: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },

    cycleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StreakCycle",
      default: null,
    },

    day: {
      type: Number,
      default: null,
    },

    referenceId: {
      type: String,
      default: null,
    },

    message: {
      type: String,
      default: "",
    },

    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    ipAddress: {
      type: String,
      default: null,
    },

    userAgent: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const AuditLog = mongoose.model(
  "AuditLog",
  auditLogSchema
);

export default AuditLog;