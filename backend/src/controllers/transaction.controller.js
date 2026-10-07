import WalletTransaction from "../models/WalletTransaction.js";

export const getTransactions = async (
  req,
  res
) => {
  try {
    const transactions =
      await WalletTransaction.find({
        userId: req.user._id,
        status: "SUCCESS",
      })
        .sort({
          createdAt: -1,
        })
        .limit(100)
        .lean();

    return res.status(200).json({
      success: true,

      data: {
        transactions,
      },
    });
  } catch (error) {
    console.error(
      "Get transactions error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to load transactions.",
    });
  }
};