import mongoose from "mongoose";

const walletTransactionSchema = new mongoose.Schema(
  {
    transactionId: {
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

    rewardType: {
      type: String,
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

    type: {
      type: String,
      enum: ["CREDIT", "DEBIT"],
      required: true,
    },

    source: {
      type: String,
      enum: [
        "DAILY_STREAK",
        "REFERRAL",
        "OFFER",
        "OTHER",
      ],
      required: true,
    },

    streakDay: {
      type: Number,
      default: null,
    },

    referenceId: {
      type: String,
      required: true,
      index: true,
    },

    balanceBefore: {
      type: Number,
      required: true,
      min: 0,
    },

    balanceAfter: {
      type: Number,
      required: true,
      min: 0,
    },

    status: {
      type: String,
      enum: ["SUCCESS", "FAILED", "REVERSED"],
      default: "SUCCESS",
    },
  },
  {
    timestamps: true,
  }
);

walletTransactionSchema.index({
  userId: 1,
  createdAt: -1,
});

const WalletTransaction = mongoose.model(
  "WalletTransaction",
  walletTransactionSchema
);

export default WalletTransaction;