import bcrypt from "bcryptjs";
import User from "../models/user.js";
import Wallet from "../models/Wallet.js";
import { generateToken } from "../utils/auth.js";
import { loginWithGoogle } from "../services/google-auth.service.js";
import { createDemoSession } from "../services/demo-auth.service.js";

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const normalizedEmail = email?.trim().toLowerCase();

    if (!name || !normalizedEmail || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required.",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must contain at least 8 characters.",
      });
    }

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      if (existingUser.authProvider === "GOOGLE") {
        return res.status(409).json({
          success: false,
          message:
            "This email is registered with Google. Please continue with Google Sign-In.",
        });
      }

      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      authProvider: "LOCAL",
      isActive: true,
      role: "USER",
      lastLoginAt: new Date(),
    });

    await Wallet.create({
      userId: user._id,
      vesBalance: 0,
      amazonGiftCardBalance: 0,
    });

    const token = generateToken(user._id);

    return res.status(201).json({
      success: true,
      message: "Account created successfully.",
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          profileImage: user.profileImage,
          authProvider: user.authProvider,
        },
        token,
      },
    });
  } catch (error) {
    console.error("Register error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to create your account.",
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const normalizedEmail = email?.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    const user = await User.findOne({
      email: normalizedEmail,
    }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your account is inactive.",
      });
    }

    if (user.authProvider === "GOOGLE" || !user.password) {
      return res.status(400).json({
        success: false,
        message:
          "This account uses Google Sign-In. Please continue with Google.",
      });
    }

    const passwordMatches = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    user.lastLoginAt = new Date();
    await user.save();

    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          profileImage: user.profileImage,
          authProvider: user.authProvider,
        },
        token,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to login. Please try again.",
    });
  }
};

export const googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({
        success: false,
        message: "Google credential is required.",
      });
    }

    const result = await loginWithGoogle(credential);

    return res.status(200).json({
      success: true,
      message: "Google login successful.",
      data: result,
    });
  } catch (error) {
    console.error("Google login error:", error);

    const statusMap = {
      GOOGLE_CREDENTIAL_REQUIRED: 400,
      GOOGLE_TOKEN_INVALID: 401,
      GOOGLE_PROFILE_INCOMPLETE: 401,
      GOOGLE_EMAIL_NOT_VERIFIED: 403,
      ACCOUNT_INACTIVE: 403,
    };

    return res.status(statusMap[error.code] || 401).json({
      success: false,
      message:
        error.message || "Unable to sign in with Google.",
    });
  }
};

export const getMe = async (req, res) => {
  return res.status(200).json({
    success: true,
    data: {
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        profileImage: req.user.profileImage,
        authProvider: req.user.authProvider,
      },
    },
  });
};

export const demoLogin = async (req, res) => {
  try {
    const result = await createDemoSession();
    return res.status(201).json({
      success: true,
      message: "Demo session created.",
      data: result,
    });
  } catch (error) {
    console.error("Demo login error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to start demo session.",
    });
  }
};

export const updateMe = async (req, res) => {
  try {
    const { name, profileImage } = req.body || {};
    const updates = {};

    if (name !== undefined) {
      const cleanName = String(name).trim();
      if (cleanName.length < 2 || cleanName.length > 80) {
        return res.status(400).json({
          success: false,
          message: "Name must be between 2 and 80 characters.",
        });
      }
      updates.name = cleanName;
    }

    if (profileImage !== undefined) {
      const value = profileImage === null ? null : String(profileImage).trim();
      if (value && value.length > 2000) {
        return res.status(400).json({
          success: false,
          message: "Profile image URL is too long.",
        });
      }
      updates.profileImage = value || null;
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select("-password");

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          profileImage: user.profileImage,
          authProvider: user.authProvider,
        },
      },
    });
  } catch (error) {
    console.error("Update profile error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to update profile.",
    });
  }
};
