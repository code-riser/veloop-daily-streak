import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("veloop_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("veloop_token");
      localStorage.removeItem("veloop_user");
      window.dispatchEvent(new Event("veloop:logout"));
    }

    return Promise.reject(error);
  }
);

export const getApiMessage = (
  error,
  fallback = "Something went wrong. Please try again."
) => {
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }

  if (error?.code === "ECONNABORTED") {
    return "Request timed out. Please check your connection.";
  }

  if (error?.code === "ERR_NETWORK") {
    return "Unable to connect to the server. Check the backend URL and CORS settings.";
  }

  return fallback;
};

export default api;