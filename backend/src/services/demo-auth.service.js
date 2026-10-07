import { randomUUID } from "crypto";
import User from "../models/user.js";
import { getOrCreateWallet } from "./wallet.service.js";
import { generateToken } from "../utils/auth.js";

export const createDemoSession = async () => {
  const shortId = randomUUID().split("-")[0].toUpperCase();
  const email = `demo-${randomUUID()}@demo.veloop.local`;

  const user = await User.create({
    name: `Demo User ${shortId}`,
    email,
    password: null,
    authProvider: "DEMO",
    profileImage: null,
    isActive: true,
    role: "USER",
    lastLoginAt: new Date(),
  });

  await getOrCreateWallet(user._id);

  return {
    token: generateToken(user._id),
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
