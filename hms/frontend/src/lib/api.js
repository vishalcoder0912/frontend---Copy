import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api/v1",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("medicare_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      localStorage.removeItem("medicare_token");
    }
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "Something went wrong";
    return Promise.reject(new Error(message));
  }
);

export default api;
