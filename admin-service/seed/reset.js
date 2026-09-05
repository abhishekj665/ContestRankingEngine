import { connectDb, disconnectDb } from "../src/config/db.js";
import prisma from "../src/services/prisma.js";

const reset = async () => {
  await connectDb();

  try {
    await prisma.winner.deleteMany({});
    await prisma.rankingRun.deleteMany({});
    console.log("Admin ranking runs and winners cleared successfully.");
  } finally {
    await disconnectDb();
  }
};

reset().catch((error) => {
  console.error("Admin seed reset failed", error);
  process.exitCode = 1;
});
