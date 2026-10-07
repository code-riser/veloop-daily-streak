import { OAuth2Client } from "google-auth-library";

import User from "../models/user.js";
import Wallet from "../models/Wallet.js";

import { generateToken } from "../utils/auth.js";

const googleClient = new OAuth2Client();

export const loginWithGoogle = async (credential) => {
  if (!credential) {
    const error = new Error(
      "Google credential is required."
    );

    error.code = "GOOGLE_CREDENTIAL_REQUIRED";

    throw error;
  }

  if (!process.env.GOOGLE_CLIENT_ID) {
    const error = new Error(
      "Google authentication is not configured on the server."
    );

    error.code = "GOOGLE_NOT_CONFIGURED";

    throw error;
  }

  let ticket;

  try {
    ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
  } catch (error) {
    const googleError = new Error(
      "Invalid or expired Google credential."
    );

    googleError.code = "GOOGLE_TOKEN_INVALID";

    throw googleError;
  }

  const payload = ticket.getPayload();

  if (!payload) {
    const error = new Error(
      "Unable to verify Google account."
    );

    error.code = "GOOGLE_TOKEN_INVALID";

    throw error;
  }

  const {
    sub: googleId,
    email,
    name,
    picture,
    email_verified: emailVerified,
  } = payload;

  if (!googleId || !email) {
    const error = new Error(
      "Google account information is incomplete."
    );

    error.code = "GOOGLE_PROFILE_INCOMPLETE";

    throw error;
  }

  if (!emailVerified) {
    const error = new Error(
      "Your Google email is not verified."
    );

    error.code = "GOOGLE_EMAIL_NOT_VERIFIED";

    throw error;
  }

  const normalizedEmail = email
    .toLowerCase()
    .trim();

  let user = await User.findOne({
    $or: [
      {
        googleId,
      },
      {
        email: normalizedEmail,
      },
    ],
  });

  if (user) {
    if (!user.isActive) {
      const error = new Error(
        "Your account is inactive."
      );

      error.code = "ACCOUNT_INACTIVE";

      throw error;
    }

    /*
     * If this is an existing account with the same
     * email but without a Google ID, link Google to it.
     *
     * We keep the existing password, so the user can
     * continue using email/password login too.
     */
    if (!user.googleId) {
      user.googleId = googleId;
    }

    /*
     * Keep GOOGLE as an additional login method.
     * Do not remove the user's existing password.
     */
    if (!user.authProvider) {
      user.authProvider = "LOCAL";
    }

    if (picture) {
      user.profileImage = picture;
    }

    if (name && !user.name) {
      user.name = name.trim();
    }

    user.lastLoginAt = new Date();

    await user.save();
  } else {
    user = await User.create({
      name:
        name?.trim() ||
        normalizedEmail.split("@")[0],

      email: normalizedEmail,

      password: null,

      googleId,

      authProvider: "GOOGLE",

      profileImage: picture || null,

      isActive: true,

      role: "USER",

      lastLoginAt: new Date(),
    });
  }

  /*
   * Make sure every user has exactly one wallet.
   */
  await Wallet.findOneAndUpdate(
    {
      userId: user._id,
    },
    {
      $setOnInsert: {
        userId: user._id,
        vesBalance: 0,
        amazonGiftCardBalance: 0,
      },
    },
    {
      upsert: true,
      new: true,
    }
  );

  const token = generateToken(user._id);

  return {
    token,

    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profileImage: user.profileImage,
      authProvider: user.authProvider,
    },
  };
};