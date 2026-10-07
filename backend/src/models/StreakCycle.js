import mongoose from "mongoose";

const streakCycleSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    cycleNumber: {
      type: Number,
      required: true,
      min: 1,
    },

    currentDay: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },

    currentStreak: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    status: {
      type: String,
      enum: [
        "ACTIVE",
        "COMPLETED",
        "MISSED",
        "RESET",
      ],
      default: "ACTIVE",
      index: true,
    },

    startedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },

    lastClaimAt: {
      type: Date,
      default: null,
    },

    nextClaimAt: {
      type: Date,
      default: null,
    },

    claimDeadlineAt: {
      type: Date,
      default: null,
    },

    completedAt: {
      type: Date,
      default: null,
    },

    resetAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

streakCycleSchema.index(
  {
    userId: 1,
    cycleNumber: 1,
  },
  {
    unique: true,
  }
);

streakCycleSchema.index({
  userId: 1,
  status: 1,
});

const StreakCycle = mongoose.model(
  "StreakCycle",
  streakCycleSchema
);

export default StreakCycle;