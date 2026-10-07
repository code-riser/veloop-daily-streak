import dotenv from "dotenv";
import connectDB from "../config/db.js";
import AuditLog from "../models/AuditLog.js";

dotenv.config();

const run = async () => {
  try {
    await connectDB();

    const logs = await AuditLog.find({})
      .sort({ createdAt: -1 })
      .limit(30)
      .lean();

    console.log("\n===== RECENT AUDIT LOGS =====\n");

    logs.forEach((log) => {
      console.log({
        event: log.event,
        userId: log.userId,
        cycleId: log.cycleId,
        day: log.day,
        referenceId: log.referenceId,
        message: log.message,
        createdAt: log.createdAt,
      });
    });

    console.log(
      `\nTotal logs displayed: ${logs.length}`
    );

    process.exit(0);
  } catch (error) {
    console.error(
      "Audit log test failed:",
      error
    );

    process.exit(1);
  }
};

run();