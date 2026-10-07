import mongoose from "mongoose";

const streakRewardSchema = new mongoose.Schema(
  {
    day: {
      type: Number,
      required: true,
      min: 1,
    },

    rewardType: {
      type: String,
      enum: ["VES", "AMAZON_GIFT_CARD"],
      required: true,
    },

    currency: {
      type: String,
      required: true,
      trim: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    subtitle: {
      type: String,
      default: "",
      trim: true,
    },

    assetType: {
      type: String,
      enum: [
        "COIN",
        "GIFT_CARD",
        "GIFT",
        "CROWN",
        "CALENDAR",
        "DEFAULT",
      ],
      default: "DEFAULT",
    },

    active: {
      type: Boolean,
      default: true,
      index: true,
    },

    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

streakRewardSchema.index(
  { day: 1 },
  { unique: true }
);

const StreakReward = mongoose.model(
  "StreakReward",
  streakRewardSchema
);

export default StreakReward;