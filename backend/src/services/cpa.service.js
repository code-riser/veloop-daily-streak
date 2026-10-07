import { randomUUID } from "crypto";

import CpaEvent from "../models/CpaEvent.js";

export const startCpaOffer = async ({
  userId,
  offerId,
}) => {
  const eventId =
    `CPA-${randomUUID()}`;

  const event =
    await CpaEvent.create({
      eventId,
      userId,
      offerId,
      status: "STARTED",
      metadata: {
        demo: true,
      },
    });

  return {
    eventId: event.eventId,
    offerId: event.offerId,
    status: event.status,
    demo: true,
    rewardGranted: false,
  };
};

export const completeCpaOffer = async ({
  userId,
  eventId,
}) => {
  const event =
    await CpaEvent.findOne({
      eventId,
      userId,
    });

  if (!event) {
    const error =
      new Error(
        "CPA event not found."
      );

    error.code =
      "CPA_EVENT_NOT_FOUND";

    throw error;
  }

  if (
    event.status ===
    "COMPLETED"
  ) {
    return {
      eventId: event.eventId,
      offerId: event.offerId,
      status: event.status,
      demo: true,
      rewardGranted: false,
      alreadyCompleted: true,
    };
  }

  event.status =
    "COMPLETED";

  event.completedAt =
    new Date();

  event.metadata = {
    ...event.metadata,
    demoCompletion: true,
  };

  await event.save();

  return {
    eventId: event.eventId,
    offerId: event.offerId,
    status: event.status,
    completedAt:
      event.completedAt,
    demo: true,
    rewardGranted: false,
    message:
      "CPA demo completed. No streak reward was granted.",
  };
};

export const getCpaHistory = async (
  userId
) => {
  return CpaEvent.find({
    userId,
  })
    .sort({
      createdAt: -1,
    })
    .limit(50)
    .lean();
};