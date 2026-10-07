import mongoose from "mongoose";
import { randomUUID } from "crypto";

import StreakConfig from "../models/StreakConfig.js";
import StreakReward from "../models/StreakReward.js";
import StreakCycle from "../models/StreakCycle.js";
import StreakClaim from "../models/StreakClaim.js";
import Wallet from "../models/Wallet.js";
import WalletTransaction from "../models/WalletTransaction.js";
import AuditLog from "../models/AuditLog.js";
import CpaEvent from "../models/CpaEvent.js";

import {
  getOrCreateWallet,
  applyRewardToWallet,
} from "./wallet.service.js";

import {
  createWalletTransaction,
} from "./transaction.service.js";

/* =========================================================
   CONSTANTS
========================================================= */

const DEFAULT_CONFIG_NAME =
  "DEFAULT_DAILY_STREAK";

const ACTIVE_CYCLE_STATUS = "ACTIVE";

const MS_PER_HOUR = 60 * 60 * 1000;


/* =========================================================
   AUDIT HELPERS
========================================================= */

/**
 * Save an audit log without allowing an audit failure
 * to break the main streak flow.
 */
const saveAuditLog = async ({
  event,
  userId = null,
  cycleId = null,
  day = null,
  referenceId = null,
  message = "",
  metadata = {},
  ipAddress = null,
  userAgent = null,
  session = null,
}) => {
  try {
    const payload = {
      event,
      userId,
      cycleId,
      day,
      referenceId,
      message,
      metadata,
      ipAddress,
      userAgent,
    };

    if (session) {
      await AuditLog.create(
        [payload],
        { session }
      );
    } else {
      await AuditLog.create(payload);
    }
  } catch (error) {
    console.error(
      "Audit log failed:",
      error
    );
  }
};


/**
 * Rejection audits must be written AFTER a failed
 * transaction has rolled back.
 */
const saveClaimRejectionAudit = async ({
  userId,
  cycleId = null,
  day = null,
  referenceId = null,
  event = "STREAK_CLAIM_REJECTED",
  message,
  metadata = {},
  ipAddress = null,
  userAgent = null,
}) => {
  await saveAuditLog({
    event,
    userId,
    cycleId,
    day,
    referenceId,
    message,
    metadata,
    ipAddress,
    userAgent,
  });
};


/* =========================================================
   CONFIG
========================================================= */

const getActiveStreakConfig = async (
  session = null
) => {
  const query =
    StreakConfig.findOne({
      name: DEFAULT_CONFIG_NAME,
      active: true,
    });

  if (session) {
    query.session(session);
  }

  const config = await query;

  if (!config) {
    const error =
      new Error(
        "Daily Streak configuration is not available."
      );

    error.code =
      "STREAK_CONFIG_NOT_FOUND";

    throw error;
  }

  return config;
};


/* =========================================================
   REWARD
========================================================= */

const getRewardForDay = async (
  day,
  session = null
) => {
  const query =
    StreakReward.findOne({
      day,
      active: true,
    });

  if (session) {
    query.session(session);
  }

  return query.lean();
};


/* =========================================================
   CYCLE HELPERS
========================================================= */

const getLatestCycle = async (
  userId,
  session = null
) => {
  const query =
    StreakCycle.findOne({
      userId,
    }).sort({
      cycleNumber: -1,
    });

  if (session) {
    query.session(session);
  }

  return query;
};


/**
 * Creates the first cycle or a new cycle after
 * completion/reset.
 */
const createNewCycle = async ({
  userId,
  cycleNumber,
  now,
  session = null,
}) => {
  const cycleData = {
    userId,
    cycleNumber,
    currentDay: 1,
    currentStreak: 0,
    status: ACTIVE_CYCLE_STATUS,
    startedAt: now,
    lastClaimAt: null,
    nextClaimAt: null,
    claimDeadlineAt: null,
    completedAt: null,
    resetAt: null,
  };

  const created =
    await StreakCycle.create(
      [cycleData],
      session
        ? { session }
        : undefined
    );

  return created[0];
};


/**
 * Get active cycle.
 *
 * If no cycle exists, create Cycle #1.
 *
 * A duplicate creation race is handled through
 * MongoDB's unique (userId + cycleNumber) index.
 */
const getOrCreateActiveCycle = async ({
  userId,
  now,
  session = null,
}) => {
  const activeQuery =
    StreakCycle.findOne({
      userId,
      status: ACTIVE_CYCLE_STATUS,
    }).sort({
      cycleNumber: -1,
    });

  if (session) {
    activeQuery.session(session);
  }

  const activeCycle =
    await activeQuery;

  if (activeCycle) {
    return activeCycle;
  }

  const latestCycle =
    await getLatestCycle(
      userId,
      session
    );

  const nextCycleNumber =
    latestCycle
      ? latestCycle.cycleNumber + 1
      : 1;

  try {
    return await createNewCycle({
      userId,
      cycleNumber:
        nextCycleNumber,
      now,
      session,
    });
  } catch (error) {
    if (error.code !== 11000) {
      throw error;
    }

    const retryQuery =
      StreakCycle.findOne({
        userId,
        status: ACTIVE_CYCLE_STATUS,
      }).sort({
        cycleNumber: -1,
      });

    if (session) {
      retryQuery.session(session);
    }

    const retryCycle =
      await retryQuery;

    if (retryCycle) {
      return retryCycle;
    }

    throw error;
  }
};


/* =========================================================
   MISSED DAY / RESET
========================================================= */

/**
 * Determines whether the active cycle's claim window
 * has expired.
 */
const hasMissedClaimWindow = (
  cycle,
  now
) => {
  if (
    !cycle.lastClaimAt ||
    !cycle.claimDeadlineAt
  ) {
    return false;
  }

  return (
    now >
    cycle.claimDeadlineAt
  );
};


/**
 * Reset an expired cycle.
 *
 * IMPORTANT:
 * This function does NOT throw.
 *
 * It updates the old cycle to MISSED and creates
 * a new active cycle inside the same transaction.
 */
const resetMissedCycle = async ({
  cycle,
  now,
  reason,
  session,
}) => {
  cycle.status = "MISSED";
  cycle.resetAt = now;

  await cycle.save({
    session,
  });

  await saveAuditLog({
    event: "STREAK_RESET",
    userId: cycle.userId,
    cycleId: cycle._id,
    day: cycle.currentDay,
    message:
      "Daily streak cycle was reset because the claim window expired.",
    metadata: {
      reason,
      previousCycleNumber:
        cycle.cycleNumber,
    },
    session,
  });

  const newCycle =
    await createNewCycle({
      userId: cycle.userId,
      cycleNumber:
        cycle.cycleNumber + 1,
      now,
      session,
    });

  return newCycle;
};


/**
 * Check missed cycle during GET/status request.
 *
 * This function uses a transaction because resetting a cycle
 * requires updating the old cycle and creating a new one.
 */
const checkMissedDay = async ({
  userId,
  now,
}) => {
  const session =
    await mongoose.startSession();

  try {
    let result = null;

    await session.withTransaction(
      async () => {
        const cycle =
          await getOrCreateActiveCycle({
            userId,
            now,
            session,
          });

        if (
          !hasMissedClaimWindow(
            cycle,
            now
          )
        ) {
          result = cycle;
          return;
        }

        result =
          await resetMissedCycle({
            cycle,
            now,
            reason:
              "CLAIM_WINDOW_EXPIRED",
            session,
          });
      }
    );

    return result;
  } finally {
    await session.endSession();
  }
};


/* =========================================================
   STATUS HELPERS
========================================================= */

const buildRewardStatus = ({
  rewards,
  cycle,
  wallet,
  now,
}) => {
  const currentDay =
    cycle.currentDay;

  const nextClaimAt =
    cycle.nextClaimAt;

  const claimDeadlineAt =
    cycle.claimDeadlineAt;

  const checkedIn =
    cycle.currentStreak;

  return rewards.map(
    (reward) => {
      let status = "LOCKED";

      if (
        reward.day < currentDay ||
        (cycle.status === "COMPLETED" && reward.day <= currentDay)
      ) {
        status = "CLAIMED";
      }

      if (
        reward.day === currentDay &&
        cycle.status !== "COMPLETED"
      ) {
        if (
          !cycle.lastClaimAt
        ) {
          status = "AVAILABLE";
        } else if (
          nextClaimAt &&
          now >= nextClaimAt &&
          (
            !claimDeadlineAt ||
            now <=
              claimDeadlineAt
          )
        ) {
          status = "AVAILABLE";
        } else {
          status = "LOCKED";
        }
      }

      return {
        day: reward.day,
        rewardType:
          reward.rewardType,
        currency:
          reward.currency,
        amount:
          reward.amount,
        title:
          reward.title,
        subtitle:
          reward.subtitle,
        assetType:
          reward.assetType,
        metadata:
          reward.metadata || {},
        status,
      };
    }
  );
};


/* =========================================================
   GET STREAK STATUS
========================================================= */

export const getStreakStatus =
  async (userId) => {
    const now =
      new Date();

    let cycle =
      await checkMissedDay({
        userId,
        now,
      });

    if (!cycle) {
      cycle =
        await getOrCreateActiveCycle({
          userId,
          now,
        });
    }

    const [
      config,
      rewards,
      wallet,
    ] = await Promise.all([
      getActiveStreakConfig(),
      StreakReward.find({
        active: true,
      })
        .sort({
          day: 1,
        })
        .lean(),
      getOrCreateWallet(
        userId
      ),
    ]);

    const rewardStatus =
      buildRewardStatus({
        rewards,
        cycle,
        wallet,
        now,
      });

    const totalVES =
      wallet.vesBalance;

    const totalGiftCard =
      wallet.amazonGiftCardBalance;

    const currentDay =
      cycle.currentDay;

    const isCompleted =
      cycle.status ===
      "COMPLETED";

    return {
      serverTime:
        now.toISOString(),

      config: {
        totalDays:
          config.totalDays,

        claimIntervalHours:
          config.claimIntervalHours,

        claimWindowHours:
          config.claimWindowHours,

        active:
          config.active,

        version:
          config.version,
      },

      cycle: {
        id:
          cycle._id,

        cycleNumber:
          cycle.cycleNumber,

        currentDay,

        currentStreak:
          cycle.currentStreak,

        status:
          cycle.status,

        startedAt:
          cycle.startedAt,

        lastClaimAt:
          cycle.lastClaimAt,

        nextClaimAt:
          cycle.nextClaimAt,

        claimDeadlineAt:
          cycle.claimDeadlineAt,

        completedAt:
          cycle.completedAt,

        resetAt:
          cycle.resetAt,
      },

      currentStreak:
        cycle.currentStreak,

      currentDay,

      checkedIn:
        cycle.currentStreak,

      totalRewards:
        rewards.length,

      totalVES,

      totalGiftCard,

      status:
        cycle.status,

      nextClaimAt:
        cycle.nextClaimAt,

      claimDeadlineAt:
        cycle.claimDeadlineAt,

      isCompleted,

      rewards:
        rewardStatus,
    };
  };


/* =========================================================
   CLAIM VALIDATION HELPERS
========================================================= */

const createServiceError = (
  message,
  code
) => {
  const error =
    new Error(message);

  error.code = code;

  return error;
};


/* =========================================================
   CLAIM DAILY REWARD
========================================================= */

export const claimDailyReward =
  async ({
    userId,
    requestedDay = null,
    cpaEventId = null,
    ipAddress = null,
    userAgent = null,
  }) => {
    const session =
      await mongoose.startSession();

    const now =
      new Date();

    let rejectionAudit =
      null;

    try {
      let result = null;

      /*
       * -----------------------------------------------------
       * FIRST TRANSACTION
       *
       * Handles:
       * - validation
       * - reset
       * - claim
       * - wallet credit
       * - transaction
       * - claim record
       * - success audit
       * -----------------------------------------------------
       */

      await session.withTransaction(
        async () => {
      
          let cycle =
            await getOrCreateActiveCycle({
              userId,
              now,
              session,
            });
      
          const config =
            await getActiveStreakConfig(
              session
            );

          /*
           * CPA is a demo prerequisite only. It never
           * grants the reward. The actual reward is granted
           * below in the same MongoDB transaction.
           */
          if (!cpaEventId) {
            throw createServiceError(
              "Complete the demo reward check before claiming.",
              "CPA_REQUIRED"
            );
          }

          const cpaEvent = await CpaEvent.findOne({
            eventId: cpaEventId,
            userId,
            status: "COMPLETED",
          }).session(session);

          if (!cpaEvent) {
            throw createServiceError(
              "The demo reward check is not completed.",
              "CPA_NOT_COMPLETED"
            );
          }
      
          
          /*
           * --------------------------------------------------
           * CLAIM REQUEST AUDIT
           * --------------------------------------------------
           */
          await saveAuditLog({
            event:
              "STREAK_CLAIM_REQUEST",

            userId,

            cycleId:
              cycle._id,

            day:
              cycle.currentDay,

            message:
              "Daily streak claim request received.",

            metadata: {
              requestedDay,
              serverDay:
                cycle.currentDay,
            },

            ipAddress,
            userAgent,

            session,
          });


          /*
           * --------------------------------------------------
           * MISSED DAY
           *
           * IMPORTANT:
           * We DO NOT throw here.
           *
           * Instead:
           * 1. Mark old cycle MISSED.
           * 2. Create new Day 1 cycle.
           * 3. Set rejectionAudit.
           * 4. Commit transaction.
           *
           * The controller will still return STREAK_RESET.
           * --------------------------------------------------
           */

          if (
            hasMissedClaimWindow(
              cycle,
              now
            )
          ) {
            const previousCycleId =
              cycle._id;

            const previousDay =
              cycle.currentDay;

            cycle =
              await resetMissedCycle({
                cycle,
                now,
                reason:
                  "CLAIM_WINDOW_EXPIRED",
                session,
              });

            rejectionAudit = {
              event:
                "STREAK_CLAIM_REJECTED",

              userId,

              cycleId:
                previousCycleId,

              day:
                previousDay,

              message:
                "Claim rejected because the previous streak window was missed and the cycle was reset.",

              metadata: {
                reason:
                  "STREAK_RESET",

                newCycleId:
                  cycle._id,

                newCycleNumber:
                  cycle.cycleNumber,
              },

              ipAddress,
              userAgent,
            };

            /*
             * Return from transaction WITHOUT throwing.
             * This allows reset to commit.
             */
            result = {
              reset: true,

              cycleId:
                cycle._id,

              currentDay:
                cycle.currentDay,

              currentStreak:
                cycle.currentStreak,

              serverTime:
                now.toISOString(),
            };

            return;
          }


          /*
           * --------------------------------------------------
           * DAY VALIDATION
           * --------------------------------------------------
           */

          if (
            requestedDay !== null &&
            requestedDay !==
              cycle.currentDay
          ) {
            rejectionAudit = {
              event:
                "INVALID_CLAIM",

              userId,

              cycleId:
                cycle._id,

              day:
                cycle.currentDay,

              message:
                "Client requested a day different from the backend current day.",

              metadata: {
                requestedDay,

                serverDay:
                  cycle.currentDay,
              },

              ipAddress,
              userAgent,
            };

            throw createServiceError(
              "Invalid streak day.",
              "INVALID_DAY"
            );
          }


          /*
           * --------------------------------------------------
           * EARLY CLAIM CHECK
           * --------------------------------------------------
           */

          if (
            cycle.nextClaimAt &&
            now <
              cycle.nextClaimAt
          ) {
            rejectionAudit = {
              event:
                "STREAK_CLAIM_REJECTED",

              userId,

              cycleId:
                cycle._id,

              day:
                cycle.currentDay,

              message:
                "Claim rejected because the reward is not available yet.",

              metadata: {
                reason:
                  "CLAIM_TOO_EARLY",

                nextClaimAt:
                  cycle.nextClaimAt,
              },

              ipAddress,
              userAgent,
            };

            const error =
              createServiceError(
                "Today's reward is not available yet.",
                "CLAIM_TOO_EARLY"
              );

            error.nextClaimAt =
              cycle.nextClaimAt;

            throw error;
          }


          /*
           * --------------------------------------------------
           * STREAK STATE VALIDATION
           * --------------------------------------------------
           */

          if (
            cycle.status !==
              ACTIVE_CYCLE_STATUS ||
            cycle.currentDay < 1 ||
            cycle.currentDay >
              config.totalDays
          ) {
            rejectionAudit = {
              event:
                "STREAK_CLAIM_REJECTED",

              userId,

              cycleId:
                cycle._id,

              day:
                cycle.currentDay,

              message:
                "Claim rejected because the streak cycle is in an invalid state.",

              metadata: {
                reason:
                  "INVALID_STREAK_STATE",

                status:
                  cycle.status,

                currentDay:
                  cycle.currentDay,
              },

              ipAddress,
              userAgent,
            };

            throw createServiceError(
              "Invalid streak state.",
              "INVALID_STREAK_STATE"
            );
          }


          /*
           * --------------------------------------------------
           * LOAD REWARD FROM DATABASE
           *
           * NEVER trust:
           * amount
           * rewardType
           * currency
           *
           * from req.body.
           * --------------------------------------------------
           */

          const reward =
            await getRewardForDay(
              cycle.currentDay,
              session
            );

          if (!reward) {
            rejectionAudit = {
              event:
                "STREAK_CLAIM_REJECTED",

              userId,

              cycleId:
                cycle._id,

              day:
                cycle.currentDay,

              message:
                "Reward configuration was not found for the current streak day.",

              metadata: {
                reason:
                  "REWARD_NOT_FOUND",
              },

              ipAddress,
              userAgent,
            };

            throw createServiceError(
              "Reward configuration not found.",
              "REWARD_NOT_FOUND"
            );
          }


          /*
           * --------------------------------------------------
           * DUPLICATE CLAIM CHECK
           * --------------------------------------------------
           */

          const existingClaim =
            await StreakClaim.findOne({
              userId,

              cycleId:
                cycle._id,

              day:
                cycle.currentDay,
            })
              .session(session);

          if (existingClaim) {
            rejectionAudit = {
              event:
                "DUPLICATE_CLAIM",

              userId,

              cycleId:
                cycle._id,

              day:
                cycle.currentDay,

              referenceId:
                existingClaim.claimId,

              message:
                "Duplicate streak claim rejected.",

              metadata: {
                existingClaimId:
                  existingClaim.claimId,
              },

              ipAddress,
              userAgent,
            };

            throw createServiceError(
              "This reward has already been claimed.",
              "DUPLICATE_CLAIM"
            );
          }


          /*
           * --------------------------------------------------
           * WALLET
           * --------------------------------------------------
           */

          const wallet =
            await getOrCreateWallet(
              userId,
              session
            );


          /*
           * --------------------------------------------------
           * APPLY REWARD
           *
           * Reward values come ONLY from MongoDB.
           * --------------------------------------------------
           */

          const {
            balanceBefore,
            balanceAfter,
          } =
            await applyRewardToWallet({
              wallet,
              reward,
              session,
            });


          /*
           * --------------------------------------------------
           * CLAIM ID
           * --------------------------------------------------
           */

          const claimId =
            `CLM-${randomUUID()}`;


          /*
           * --------------------------------------------------
           * TRANSACTION
           * --------------------------------------------------
           */

          const transaction =
            await createWalletTransaction({
              userId,

              reward,

              streakDay:
                cycle.currentDay,

              referenceId:
                claimId,

              balanceBefore,

              balanceAfter,

              session,
            });


          /*
           * --------------------------------------------------
           * CLAIM RECORD
           * --------------------------------------------------
           */

          await StreakClaim.create(
            [
              {
                claimId,

                userId,

                cycleId:
                  cycle._id,

                day:
                  cycle.currentDay,

                rewardId:
                  reward._id,

                rewardType:
                  reward.rewardType,

                amount:
                  reward.amount,

                currency:
                  reward.currency,

                status:
                  "SUCCESS",

                claimedAt:
                  now,

                transactionId:
                  transaction.transactionId,
              },
            ],
            {
              session,
            }
          );


          /*
           * --------------------------------------------------
           * UPDATE CYCLE
           * --------------------------------------------------
           */

          const claimedDay =
            cycle.currentDay;

            const totalDays =
            config.totalDays;

          cycle.lastClaimAt =
            now;

          cycle.currentStreak =
            cycle.currentStreak + 1;

            /*
            * Final streak day completes the cycle.
            */
          if (
            claimedDay >=
            totalDays
          ) {
            cycle.currentDay =
              totalDays;

            cycle.status =
              "COMPLETED";

            cycle.completedAt =
              now;

            cycle.nextClaimAt =
              null;

            cycle.claimDeadlineAt =
              null;
          } else {
            cycle.currentDay =
              claimedDay + 1;

              cycle.nextClaimAt =
              new Date(
                now.getTime() +
                  config.claimIntervalHours *
                    MS_PER_HOUR
              );
            
            cycle.claimDeadlineAt =
              new Date(
                now.getTime() +
                  (
                    config.claimIntervalHours +
                    config.claimWindowHours
                  ) *
                    MS_PER_HOUR
              );
          }

          await cycle.save({
            session,
          });


          /*
           * --------------------------------------------------
           * SUCCESS AUDIT
           * --------------------------------------------------
           */

          await saveAuditLog({
            event:
              "STREAK_CLAIM_SUCCESS",

            userId,

            cycleId:
              cycle._id,

            day:
              claimedDay,

            referenceId:
              claimId,

            message:
              "Daily streak reward claimed successfully.",

            metadata: {
              rewardType:
                reward.rewardType,

              amount:
                reward.amount,

              currency:
                reward.currency,

              transactionId:
                transaction.transactionId,

              balanceBefore,

              balanceAfter,
            },

            ipAddress,
            userAgent,

            session,
          });


          /*
           * --------------------------------------------------
           * RESPONSE DATA
           * --------------------------------------------------
           */

          result = {
            reset: false,

            claimId,

            transactionId:
              transaction.transactionId,

            cycleId:
              cycle._id,

            claimedDay,

            reward: {
              rewardType:
                reward.rewardType,

              amount:
                reward.amount,

              currency:
                reward.currency,

              title:
                reward.title,

              subtitle:
                reward.subtitle,

              assetType:
                reward.assetType,
              metadata:
                reward.metadata || {},
            },

            wallet: {
              balanceBefore,

              balanceAfter,

              currency:
                wallet.currency,
            },

            streak: {
              currentStreak:
                cycle.currentStreak,

              currentDay:
                cycle.currentDay,

              status:
                cycle.status,

              nextClaimAt:
                cycle.nextClaimAt,

              claimDeadlineAt:
                cycle.claimDeadlineAt,

              completedAt:
                cycle.completedAt,
            },

            serverTime:
              now.toISOString(),
          };
        }
      );


      /*
       * -----------------------------------------------------
       * RESET RESULT
       *
       * Reset was successfully committed.
       * Now throw STREAK_RESET outside the transaction.
       * -----------------------------------------------------
       */

      if (
        rejectionAudit?.metadata
          ?.reason ===
        "STREAK_RESET"
      ) {
        await saveClaimRejectionAudit(
          rejectionAudit
        );

        rejectionAudit = null;

        const resetError =
          createServiceError(
            "Your previous streak day was missed. Your streak has been reset to Day 1.",
            "STREAK_RESET"
          );

        throw resetError;
      }


      return result;
    } catch (error) {
      /*
       * -----------------------------------------------------
       * SAVE REJECTION AUDIT AFTER ROLLBACK
       * -----------------------------------------------------
       */

      if (rejectionAudit) {
        await saveClaimRejectionAudit(
          rejectionAudit
        );

        rejectionAudit = null;
      }


      /*
       * -----------------------------------------------------
       * MONGODB UNIQUE CONSTRAINT
       *
       * Handles race condition where two requests
       * try to create the same claim.
       * -----------------------------------------------------
       */

      if (
        error?.code === 11000
      ) {
        await saveClaimRejectionAudit({
          event:
            "DUPLICATE_CLAIM",

          userId,

          day:
            requestedDay,

          message:
            "Duplicate streak claim rejected by database uniqueness protection.",

          metadata: {
            reason:
              "DUPLICATE_DATABASE_CONSTRAINT",

            mongoCode:
              11000,
          },

          ipAddress,
          userAgent,
        });

        const duplicateError =
          createServiceError(
            "This reward has already been claimed.",
            "DUPLICATE_CLAIM"
          );

        throw duplicateError;
      }


      throw error;
    } finally {
      await session.endSession();
    }
  };

  export const getStreakHistory = async ({
    userId,
    page = 1,
    limit = 20,
  }) => {
    const safePage = Math.max(
      Number(page) || 1,
      1
    );
  
    const safeLimit = Math.min(
      Math.max(Number(limit) || 20, 1),
      100
    );
  
    const skip =
      (safePage - 1) * safeLimit;
  
    const [claims, total] =
      await Promise.all([
        StreakClaim.find({
          userId,
        })
          .sort({
            claimedAt: -1,
          })
          .skip(skip)
          .limit(safeLimit)
          .populate({
            path: "rewardId",
            select:
              "day rewardType currency amount title subtitle assetType",
          })
          .lean(),
  
        StreakClaim.countDocuments({
          userId,
        }),
      ]);
  
    return {
      history: claims.map((claim) => ({
        claimId: claim.claimId,
  
        day: claim.day,
  
        reward: {
          rewardType:
            claim.rewardType,
  
          amount:
            claim.amount,
  
          currency:
            claim.currency,
  
          title:
            claim.rewardId?.title ||
            `Day ${claim.day} Reward`,
  
          subtitle:
            claim.rewardId?.subtitle ||
            "",
  
          assetType:
            claim.rewardId?.assetType ||
            "DEFAULT",

          metadata:
            claim.rewardId?.metadata || {},
        },
  
        status: claim.status,
  
        transactionId:
          claim.transactionId,
  
        claimedAt:
          claim.claimedAt,
  
        createdAt:
          claim.createdAt,
      })),
  
      pagination: {
        page: safePage,
        limit: safeLimit,
        total,
        totalPages:
          Math.ceil(
            total / safeLimit
          ),
        hasNextPage:
          skip + claims.length < total,
        hasPreviousPage:
          safePage > 1,
      },
    };
  };