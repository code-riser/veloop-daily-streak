import mongoose from "mongoose";

const cpaEventSchema = new mongoose.Schema(
  {
    eventId: {
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

    offerId: {
      type: String,
      required: true,
      trim: true,
    },

    status: {
      type: String,
      enum: [
        "STARTED",
        "COMPLETED",
        "FAILED",
      ],
      default: "STARTED",
    },

    completedAt: {
      type: Date,
      default: null,
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

cpaEventSchema.index({
  userId: 1,
  createdAt: -1,
});

const CpaEvent = mongoose.model(
  "CpaEvent",
  cpaEventSchema
);

export default CpaEvent;