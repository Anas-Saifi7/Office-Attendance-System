import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_URL
    ? `${API_URL.replace(/\/$/, "")}/api`
    : "/api",
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
  },
);

export const errMsg = (e) =>
  e.response?.data?.message || e.message || "Something went wrong";

export default api;
