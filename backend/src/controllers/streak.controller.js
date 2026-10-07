import {
  getStreakStatus,
  claimDailyReward,
  getStreakHistory,
} from "../services/streak.service.js";

const parsePositiveInteger = (value, fallback) => {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed < 1) {
    return fallback;
  }

  return parsed;
};

export const getDailyStreak = async (req, res) => {
  try {
    const status = await getStreakStatus(req.user._id);

    return res.status(200).json({
      success: true,
      data: status,
    });
  } catch (error) {
    console.error("Get Daily Streak error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load Daily Streak.",
    });
  }
};

export const claimReward = async (req, res) => {
  try {
    /*
     * IMPORTANT:
     * We intentionally do NOT accept:
     *
     * day
     * streak
     * reward
     * amount
     * currency
     * userId
     *
     * Backend calculates everything.
     */

    const result = await claimDailyReward({
      userId: req.user._id,
      cpaEventId: req.body?.cpaEventId || null,
      ipAddress: req.ip || null,
      userAgent: req.get("user-agent") || null,
    });

    return res.status(200).json({
      success: true,
      message: "Daily streak reward claimed successfully.",
      data: result,
    });
  } catch (error) {
    console.error("Claim Daily Reward error:", error);

    const statusMap = {
      STREAK_RESET: 409,
      CLAIM_TOO_EARLY: 409,
      INVALID_STREAK_STATE: 409,
      CPA_REQUIRED: 400,
      CPA_NOT_COMPLETED: 409,
      REWARD_NOT_FOUND: 500,
      DUPLICATE_CLAIM: 409,
      CLAIM_NOT_AVAILABLE: 409,
      STREAK_CONFIG_NOT_FOUND: 500,
    };

    const statusCode = statusMap[error.code] || 500;

    const response = {
      success: false,
      message: error.message || "Unable to claim reward.",
    };

    if (error.nextClaimAt) {
      response.nextClaimAt = error.nextClaimAt;
    }

    return res.status(statusCode).json(response);
  }
};

export const getDailyStreakHistory = async (req, res) => {
  try {
    const page = parsePositiveInteger(req.query.page, 1);
    const limit = parsePositiveInteger(req.query.limit, 20);

    if (limit > 100) {
      return res.status(400).json({
        success: false,
        message: "Limit cannot exceed 100.",
      });
    }

    const result = await getStreakHistory({
      userId: req.user._id,
      page,
      limit,
    });

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Get Daily Streak History error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load Daily Streak history.",
    });
  }
};