import api from "./api";

export const login = (payload) =>
  api.post("/auth/login", {
    email: payload.email.trim().toLowerCase(),
    password: payload.password,
  });

export const register = (payload) =>
  api.post("/auth/register", {
    name: payload.name.trim(),
    email: payload.email.trim().toLowerCase(),
    password: payload.password,
  });

export const getMe = () => api.get("/auth/me");

export const googleLogin = (credential) =>
  api.post("/auth/google", { credential });

export const demoLogin = () => api.post("/auth/demo");

export const updateMe = (payload) => api.patch("/auth/me", payload);
