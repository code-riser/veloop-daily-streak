import dotenv from "dotenv";
import mongoose from "mongoose";

import connectDB from "../config/db.js";
import StreakConfig from "../models/StreakConfig.js";
import StreakReward from "../models/StreakReward.js";

dotenv.config();

const rewards = [
  {
    day: 1,
    rewardType: "VES",
    currency: "VES",
    amount: 5,
    title: "+5 VEs",
    subtitle: "Daily streak reward",
    assetType: "COIN",
    active: true,
    metadata: { asset: "VEs_Coin.png" },
  },

  {
    day: 2,
    rewardType: "VES",
    currency: "VES",
    amount: 10,
    title: "+10 VEs",
    subtitle: "Keep your streak alive",
    assetType: "COIN",
    active: true,
    metadata: { asset: "VEs_Coin.png" },
  },

  {
    day: 3,
    rewardType: "VES",
    currency: "VES",
    amount: 15,
    title: "+15 VEs",
    subtitle: "You're building momentum",
    assetType: "COIN",
    active: true,
    metadata: { asset: "VEs_Coin.png" },
  },

  {
    day: 4,
    rewardType: "AMAZON_GIFT_CARD",
    currency: "INR",
    amount: 1,
    title: "₹1 Amazon Gift Card",
    subtitle: "Special streak reward",
    assetType: "GIFT_CARD",
    active: true,
    metadata: { asset: "Day-4.png" },
  },

  {
    day: 5,
    rewardType: "AMAZON_GIFT_CARD",
    currency: "INR",
    amount: 2,
    title: "₹2 Amazon Gift Card",
    subtitle: "Your streak is growing",
    assetType: "GIFT_CARD",
    active: true,
    metadata: { asset: "Day-5.png" },
  },

  {
    day: 6,
    rewardType: "VES",
    currency: "VES",
    amount: 30,
    title: "+30 VEs",
    subtitle: "Almost at the ultimate reward",
    assetType: "COIN",
    active: true,
    metadata: { asset: "VEs_Coin.png" },
  },

  {
    day: 7,
    rewardType: "AMAZON_GIFT_CARD",
    currency: "INR",
    amount: 5,
    title: "₹5 Amazon Gift Card",
    subtitle: "Ultimate streak reward",
    assetType: "CROWN",
    active: true,
    metadata: { asset: "Day-7.png" },
  },
];

const seedStreakData = async () => {
  try {
    await connectDB();

    console.log("Seeding Daily Streak configuration...");

    /*
     * One active configuration.
     *
     * claimIntervalHours = 24
     *
     * claimWindowHours = 24
     *
     * Meaning:
     * Day unlocks after 24h and remains
     * claimable for another 24h.
     */
    const config = await StreakConfig.findOneAndUpdate(
      {
        name: "DEFAULT_DAILY_STREAK",
      },
      {
        name: "DEFAULT_DAILY_STREAK",
        totalDays: 7,
        claimIntervalHours: 24,
        claimWindowHours: 24,
        active: true,
        version: 1,
      },
      {
        upsert: true,
        returnDocument: "after",
        setDefaultsOnInsert: true,
      }
    );

    console.log(
      `Streak config ready: ${config._id}`
    );

    /*
     * Upsert all 7 rewards.
     */
    for (const reward of rewards) {
      await StreakReward.findOneAndUpdate(
        { day: reward.day },
        reward,
        {
          upsert: true,
          returnDocument: "after",
          setDefaultsOnInsert: true,
        }
      );
    }

    console.log(
      "7 Daily Streak rewards seeded successfully."
    );

    const rewardCount = await StreakReward.countDocuments({
      active: true,
    });

    console.log(
      `Active rewards in database: ${rewardCount}`
    );

    console.log("Daily Streak seed completed.");

    await mongoose.connection.close();

    process.exit(0);
  } catch (error) {
    console.error(
      "Daily Streak seed failed:",
      error
    );

    await mongoose.connection.close();

    process.exit(1);
  }
};

seedStreakData();