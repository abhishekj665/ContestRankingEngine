import axios from "axios";
import { env } from "../config/env.js";

const userServiceClient = axios.create({
  baseURL: env.USER_SERVICE_URL,
  timeout: 5000,
  headers: {
    "x-internal-key": env.INTERNAL_SERVICE_KEY,
  },
});

export const fetchScoredPosts = async () => {
  const response = await userServiceClient.get("/internal/scored-posts");

  return response.data;
};

export const fetchEligibleUsers = async () => {
  const response = await userServiceClient.get("/internal/eligible-users");

  return response.data;
};

export const fetchWeeklyTopThree = async () => {
  const response = await userServiceClient.get("/internal/weekly-top-three");

  return response.data;
};

export default userServiceClient;
