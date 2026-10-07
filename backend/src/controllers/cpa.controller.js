import {
    startCpaOffer,
    completeCpaOffer,
    getCpaHistory,
  } from "../services/cpa.service.js";
  
  export const startCpa = async (
    req,
    res
  ) => {
    try {
      const {
        offerId = "DEMO-OFFER-001",
      } = req.body || {};
  
      const result =
        await startCpaOffer({
          userId: req.user._id,
          offerId,
        });
  
      return res.status(201).json({
        success: true,
        message:
          "CPA demo offer started.",
        data: result,
      });
    } catch (error) {
      console.error(
        "Start CPA error:",
        error
      );
  
      return res.status(500).json({
        success: false,
        message:
          "Unable to start CPA demo.",
      });
    }
  };
  
  export const completeCpa = async (
    req,
    res
  ) => {
    try {
      const {
        eventId,
      } = req.body || {};
  
      if (!eventId) {
        return res.status(400).json({
          success: false,
          message:
            "eventId is required.",
        });
      }
  
      const result =
        await completeCpaOffer({
          userId: req.user._id,
          eventId,
        });
  
      return res.status(200).json({
        success: true,
        message:
          result.message ||
          "CPA demo completed.",
        data: result,
      });
    } catch (error) {
      console.error(
        "Complete CPA error:",
        error
      );
  
      const statusCode =
        error.code ===
        "CPA_EVENT_NOT_FOUND"
          ? 404
          : 500;
  
      return res.status(
        statusCode
      ).json({
        success: false,
        message:
          error.message ||
          "Unable to complete CPA demo.",
      });
    }
  };
  
  export const getCpaEvents = async (
    req,
    res
  ) => {
    try {
      const events =
        await getCpaHistory(
          req.user._id
        );
  
      return res.status(200).json({
        success: true,
        data: {
          events,
        },
      });
    } catch (error) {
      console.error(
        "Get CPA history error:",
        error
      );
  
      return res.status(500).json({
        success: false,
        message:
          "Unable to load CPA history.",
      });
    }
  };