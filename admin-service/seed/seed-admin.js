import bcrypt from "bcrypt";
import { connectDb, disconnectDb } from "../src/config/db.js";
import { env } from "../src/config/env.js";
import prisma from "../src/services/prisma.js";

const seedAdmin = async () => {
  if (!env.ADMIN_EMAIL || !env.ADMIN_PASSWORD) {
    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD are required");
  }

  await connectDb();

  try {
    const passwordHash = await bcrypt.hash(env.ADMIN_PASSWORD, 12);
    const admin = await prisma.admin.upsert({
      where: { email: env.ADMIN_EMAIL },
      update: {},
      create: {
        email: env.ADMIN_EMAIL,
        passwordHash,
      },
    });

    console.log(`Admin seed completed for ${admin.email}`);
  } finally {
    await disconnectDb();
  }
};

seedAdmin().catch((error) => {
  console.error("Admin seed failed", error);
  process.exitCode = 1;
});
