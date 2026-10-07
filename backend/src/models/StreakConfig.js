import mongoose from "mongoose";

const streakConfigSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    totalDays: {
      type: Number,
      required: true,
      min: 1,
    },

    // Time between successful claims before next day unlocks.
    claimIntervalHours: {
      type: Number,
      required: true,
      min: 1,
    },

    // How long the unlocked day remains claimable.
    // If the user doesn't claim within this window,
    // the streak can be reset by the backend.
    claimWindowHours: {
      type: Number,
      required: true,
      min: 1,
    },

    active: {
      type: Boolean,
      default: true,
      index: true,
    },

    version: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
  }
);

const StreakConfig = mongoose.model("StreakConfig", streakConfigSchema);

export default StreakConfig;