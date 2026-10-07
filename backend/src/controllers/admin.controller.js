import {
  getConfig,
  updateConfig,
  fetchRewards,     // सर्विस से नए फंक्शन्स इम्पोर्ट किए
  addReward,
  editReward,
  removeReward
} from "../services/admin.service.js";

// ==========================================
// ⚙️ Admin Config Controllers (Unchanged)
// ==========================================
export const getAdminConfig = async (req, res) => {
  try {
    const config = await getConfig();
    return res.json({
      success: true,
      data: config,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateAdminConfig = async (req, res) => {
  try {
    const config = await updateConfig(req.body);
    return res.json({
      success: true,
      data: config,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// 🎁 Admin Reward Controllers (Added Below)
// ==========================================

// 1. सभी रिवॉर्ड्स प्राप्त करने के लिए
export const getAllRewards = async (req, res) => {
  try {
    const rewards = await fetchRewards();
    return res.json({
      success: true,
      data: rewards,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// 2. नया रिवॉर्ड बनाने के लिए
export const createReward = async (req, res) => {
  try {
    const newReward = await addReward(req.body);
    return res.status(201).json({
      success: true,
      data: newReward,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// 3. रिवॉर्ड को अपडेट करने के लिए
export const updateReward = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedReward = await editReward(id, req.body);
    return res.json({
      success: true,
      data: updatedReward,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// 4. रिवॉर्ड को डिलीट करने के लिए
export const deleteReward = async (req, res) => {
  try {
    const { id } = req.params;
    await removeReward(id);
    return res.json({
      success: true,
      message: "Reward deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
