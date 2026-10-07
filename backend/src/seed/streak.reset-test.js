import dotenv from "dotenv";
import mongoose from "mongoose";
import dns from "dns";

import connectDB from "../config/db.js";
import StreakCycle from "../models/StreakCycle.js";

dotenv.config();

dns.setServers(["8.8.8.8", "1.1.1.1"]);

const run = async () => {
  try {
    await connectDB();

    const cycle = await StreakCycle.findOne({
      status: "ACTIVE",
    }).sort({
      createdAt: -1,
    });

    if (!cycle) {
      console.log(
        "No active streak cycle found."
      );
      process.exit(0);
    }

    const expiredTime = new Date(
      Date.now() - 60 * 1000
    );

    cycle.claimDeadlineAt = expiredTime;
    cycle.nextClaimAt = expiredTime;

    await cycle.save();

    console.log(
      "Streak cycle marked as expired for reset testing."
    );

    console.log(
      `Cycle ID: ${cycle._id}`
    );

    console.log(
      `Current Day: ${cycle.currentDay}`
    );

    console.log(
      `Claim Deadline: ${cycle.claimDeadlineAt.toISOString()}`
    );

    process.exit(0);
  } catch (error) {
    console.error(
      "Reset test failed:",
      error
    );

    process.exit(1);
  }
};

run();