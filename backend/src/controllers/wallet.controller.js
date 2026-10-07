import {
    getOrCreateWallet,
  } from "../services/wallet.service.js";
  
  export const getWallet = async (
    req,
    res
  ) => {
    try {
      const wallet =
        await getOrCreateWallet(
          req.user._id
        );
  
      return res.status(200).json({
        success: true,
  
        data: {
          wallet: {
            vesBalance:
              wallet.vesBalance,
  
            amazonGiftCardBalance:
              wallet.amazonGiftCardBalance,
  
            currency:
              wallet.currency,
          },
        },
      });
    } catch (error) {
      console.error(
        "Get wallet error:",
        error
      );
  
      return res.status(500).json({
        success: false,
        message:
          "Unable to load wallet.",
      });
    }
  };