import StreakConfig from "../models/StreakConfig.js";
import StreakReward from "../models/StreakReward.js"; // 1. आपका रिवॉर्ड मॉडल इम्पोर्ट किया

// ==========================================
// ⚙️ Existing Config Services (Unchanged)
// ==========================================
export const getConfig = async () => {
  const config = await StreakConfig.findOne({
    active: true,
  }).lean();

  return config;
};

export const updateConfig = async ({
  totalDays,
  claimIntervalHours,
  claimWindowHours,
}) => {
  const config =
    await StreakConfig.findOne({
      active: true,
    });

  if (!config) {
    throw new Error(
      "Active config not found"
    );
  }

  if (totalDays !== undefined) {
    config.totalDays = totalDays;
  }

  if (
    claimIntervalHours !== undefined
  ) {
    config.claimIntervalHours =
      claimIntervalHours;
  }

  if (
    claimWindowHours !== undefined
  ) {
    config.claimWindowHours =
      claimWindowHours;
  }

  await config.save();

  return config;
};

// ==========================================
// 🎁 New Reward Services (Added Below)
// ==========================================

// 1. सभी रिवॉर्ड्स की लिस्ट डेटाबेस से लाने के लिए
export const fetchRewards = async () => {
  return await StreakReward.find({}).lean();
};

// 2. नया रिवॉर्ड डेटाबेस में जोड़ने के लिए
export const addReward = async (rewardData) => {
  const newReward = new StreakReward(rewardData);
  return await newReward.save();
};

// 3. रिवॉर्ड को आईडी से अपडेट करने के लिए
export const editReward = async (id, rewardData) => {
  const updatedReward = await StreakReward.findByIdAndUpdate(
    id,
    { $set: rewardData },
    { new: true, runValidators: true }
  );
  
  if (!updatedReward) {
    throw new Error("Reward not found");
  }
  
  return updatedReward;
};

// 4. रिवॉर्ड को आईडी से डिलीट करने के लिए
export const removeReward = async (id) => {
  const deletedReward = await StreakReward.findByIdAndDelete(id);
  
  if (!deletedReward) {
    throw new Error("Reward not found");
  }
  
  return deletedReward;
};
