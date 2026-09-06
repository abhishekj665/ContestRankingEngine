import bcrypt from "bcrypt";
import { connectDb, disconnectDb } from "../src/config/db.js";
import { env } from "../src/config/env.js";
import prisma from "../src/services/prisma.js";

const seedAdmin = async () => {
  if (!env.ADMIN_EMAIL || !env.ADMIN_PASSWORD) {
    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env");
  }

  await connectDb();

  try {
    const passwordHash = await bcrypt.hash(env.ADMIN_PASSWORD, 12);
    await prisma.admin.upsert({
      where: { email: env.ADMIN_EMAIL.toLowerCase() },
      update: { passwordHash },
      create: { email: env.ADMIN_EMAIL.toLowerCase(), passwordHash },
    });
    console.log(`Admin account is ready for ${env.ADMIN_EMAIL.toLowerCase()}`);
  } finally {
    await disconnectDb();
  }
};

seedAdmin().catch((error) => {
  console.error("Admin seed failed", error.message);
  process.exitCode = 1;
});
