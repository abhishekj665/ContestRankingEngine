import dotenv from "dotenv";
dotenv.config();

export const env = {
  PORT: process.env.PORT,
  MONGO_URI: process.env.MONGO_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  ADMIN_SERVICE_URL: process.env.ADMIN_SERVICE_URL,
  INTERNAL_SERVICE_KEY: process.env.INTERNAL_SERVICE_KEY,
  CLIENT_URL: process.env.CLIENT_URL,
};
