import StreakReward from "../models/StreakReward.js";

export const getActiveRewards = async () => {
  return StreakReward.find({
    active: true,
  })
    .sort({ day: 1 })
    .lean();
};

export const getRewardForDay = async (day) => {
  return StreakReward.findOne({
    day,
    active: true,
  }).lean();
};