import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("kalashree_admin_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// If the admin's token has expired/is invalid, bounce back to admin login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("kalashree_admin_token");
      localStorage.removeItem("kalashree_admin_profile");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(err);
  }
);

export default api;
