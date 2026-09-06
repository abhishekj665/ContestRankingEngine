import dotenv from "dotenv";
dotenv.config();

const normalizeEmail = (value) =>
  value?.trim().replace(/^['"]|['"],?$/g, "");

export const env = {
  PORT: process.env.PORT,
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET,
  // Prefer a separate admin secret; retain compatibility with existing .env files.
  ADMIN_JWT_SECRET: process.env.ADMIN_JWT_SECRET ?? process.env.JWT_SECRET,
  ADMIN_EMAIL: normalizeEmail(process.env.ADMIN_EMAIL),
  // Accept the misspelled key used by early local .env files during migration.
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD ?? process.env.ADMIN_PASSOWRD,
  USER_SERVICE_URL: process.env.USER_SERVICE_URL,
  INTERNAL_SERVICE_KEY: process.env.INTERNAL_SERVICE_KEY,
};
