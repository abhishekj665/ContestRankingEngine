import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { env } from "./env.js";

if (!env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required");
}

const adapter = new PrismaPg({ connectionString: env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

export const connectDb = async () => {
  await prisma.$connect();
  console.log("Database connected");
};

export const disconnectDb = async () => {
  await prisma.$disconnect();
  console.log("Database disconnected");
};

export default prisma;
