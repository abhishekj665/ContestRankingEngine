import axios from "axios";

const adminApi = axios.create({
  baseURL: import.meta.env.VITE_ADMIN_SERVICE_URL,
  headers: { "Content-Type": "application/json" },
});

adminApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("adminToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

adminApi.interceptors.response.use(
  (response) => response.data,
  (error) => {
    return Promise.resolve(
      error.response?.data || {
        success: false,
        message: "Unable to connect to Admin Service",
      },
    );
  },
);

export const adminLogin = async (email, password) => {
  return await adminApi.post("/admin/auth/login", { email, password });
};

export const runRanking = async () => {
  return await adminApi.post("/api/rankings/run");
};

export const getWinners = async (tier = "") => {
  return await adminApi.get("/api/winners", {
    params: tier ? { tier } : {},
  });
};

export const markKycPassed = async (winnerId) => {
  return await adminApi.post(`/api/winners/${winnerId}/kyc/pass`);
};

export const markKycFailed = async (winnerId) => {
  return await adminApi.post(`/api/winners/${winnerId}/kyc/fail`);
};
