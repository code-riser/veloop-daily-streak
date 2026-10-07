import api from "./api";

export const getStreak = () => api.get("/daily-streak");
export const getStreakStatus = () => api.get("/daily-streak");
export const claimStreak = (cpaEventId) =>
  api.post("/daily-streak/claim", { cpaEventId });
export const getHistory = (page = 1, limit = 20) =>
  api.get(`/daily-streak/history?page=${page}&limit=${limit}`);
export const startCpa = () =>
  api.post("/cpa/start", { offerId: "DEMO-OFFER-001" });
export const completeCpa = (eventId) =>
  api.post("/cpa/complete", { eventId });
export const getCpaHistory = () => api.get("/cpa/history");
export const getWallet = () => api.get("/wallet");
export const getTransactions = () => api.get("/transactions");
