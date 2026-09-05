import dotenv from "dotenv";
dotenv.config();

export const env = {
  PORT: process.env.PORT,
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET,
  ADMIN_JWT_SECRET: process.env.ADMIN_JWT_SECRET,
  ADMIN_EMAIL: process.env.ADMIN_EMAIL,
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
  USER_SERVICE_URL: process.env.USER_SERVICE_URL,
  INTERNAL_SERVICE_KEY: process.env.INTERNAL_SERVICE_KEY,
};
