import Wallet from "../models/Wallet.js";

export const getOrCreateWallet = async (
  userId,
  session = null
) => {
  const query = Wallet.findOne({ userId });

  if (session) {
    query.session(session);
  }

  let wallet = await query;

  if (wallet) {
    return wallet;
  }

  try {
    const created = await Wallet.create(
      [
        {
          userId,
          vesBalance: 0,
          amazonGiftCardBalance: 0,
          currency: "VES",
        },
      ],
      session ? { session } : undefined
    );

    return created[0];
  } catch (error) {
    /*
     * Another concurrent request may have created
     * the wallet. Fetch it again.
     */
    if (error.code === 11000) {
      const retryQuery = Wallet.findOne({
        userId,
      });

      if (session) {
        retryQuery.session(session);
      }

      return retryQuery;
    }

    throw error;
  }
};

export const getRewardBalance = (
  wallet,
  rewardType
) => {
  if (rewardType === "VES") {
    return wallet.vesBalance;
  }

  if (rewardType === "AMAZON_GIFT_CARD") {
    return wallet.amazonGiftCardBalance;
  }

  throw new Error(
    `Unsupported reward type: ${rewardType}`
  );
};

export const applyRewardToWallet = async ({
  wallet,
  reward,
  session,
}) => {
  let balanceBefore;
  let balanceAfter;

  if (reward.rewardType === "VES") {
    balanceBefore = wallet.vesBalance;

    wallet.vesBalance =
      Number(wallet.vesBalance) +
      Number(reward.amount);

    balanceAfter = wallet.vesBalance;
  } else if (
    reward.rewardType === "AMAZON_GIFT_CARD"
  ) {
    balanceBefore =
      wallet.amazonGiftCardBalance;

    wallet.amazonGiftCardBalance =
      Number(wallet.amazonGiftCardBalance) +
      Number(reward.amount);

    balanceAfter =
      wallet.amazonGiftCardBalance;
  } else {
    throw new Error(
      `Unsupported reward type: ${reward.rewardType}`
    );
  }

  await wallet.save({ session });

  return {
    balanceBefore,
    balanceAfter,
  };
};