import { randomUUID } from "crypto";

import WalletTransaction from "../models/WalletTransaction.js";

export const createWalletTransaction = async ({
  userId,
  reward,
  streakDay,
  referenceId,
  balanceBefore,
  balanceAfter,
  session,
}) => {
  const transactionId =
    `TXN-${randomUUID()}`;

  const transaction =
    await WalletTransaction.create(
      [
        {
          transactionId,
          userId,

          rewardType:
            reward.rewardType,

          amount:
            reward.amount,

          currency:
            reward.currency,

          type: "CREDIT",

          source: "DAILY_STREAK",

          streakDay,

          referenceId,

          balanceBefore,

          balanceAfter,

          status: "SUCCESS",
        },
      ],
      {
        session,
      }
    );

  return transaction[0];
};