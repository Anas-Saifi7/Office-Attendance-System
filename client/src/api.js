import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

if (import.meta.env.PROD && !API_URL) {
  throw new Error("VITE_API_URL is missing in Vercel!");
}

const api = axios.create({
  baseURL: `${(API_URL || "http://localhost:5000").replace(/\/+$/, "")}/api`,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (err) => {
    if (
      err.response?.status === 401 &&
      !err.config?.url?.includes("/auth/login")
    ) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }

    return Promise.reject(err);
  }
);

export const errMsg = (e) =>
  e.response?.data?.message || e.message || "Something went wrong";

export default api;
