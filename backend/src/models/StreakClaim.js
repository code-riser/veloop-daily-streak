import mongoose from "mongoose";

const streakClaimSchema = new mongoose.Schema(
  {
    claimId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    cycleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StreakCycle",
      required: true,
      index: true,
    },

    day: {
      type: Number,
      required: true,
      min: 1,
    },

    rewardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StreakReward",
      required: true,
    },

    rewardType: {
      type: String,
      enum: [
        "VES",
        "AMAZON_GIFT_CARD",
      ],
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    currency: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: [
        "SUCCESS",
        "FAILED",
        "REJECTED",
      ],
      default: "SUCCESS",
    },

    claimedAt: {
      type: Date,
      default: Date.now,
    },

    transactionId: {
      type: String,
      default: null,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

/*
 * One user cannot successfully claim
 * the same day twice in the same cycle.
 */
streakClaimSchema.index(
  {
    userId: 1,
    cycleId: 1,
    day: 1,
  },
  {
    unique: true,
  }
);

const StreakClaim = mongoose.model(
  "StreakClaim",
  streakClaimSchema
);

export default StreakClaim;