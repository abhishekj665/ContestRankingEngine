import { connectDb, disconnectDb } from "../src/config/db.js";
import prisma from "../src/services/prisma.js";
import { markFailed, requestKyc } from "../src/services/kyc.service.js";

const runKycCascade = async () => {
  await connectDb();

  try {
    const failedTravelWinners = await prisma.winner.count({
      where: {
        tier: "CATEGORY_1ST",
        category: "Travel",
        status: "FAILED",
      },
    });

    if (failedTravelWinners >= 2) {
      console.log("Travel KYC cascade has already been demonstrated.");
      return;
    }

    const travelWinner = await prisma.winner.findFirst({
      where: {
        tier: "CATEGORY_1ST",
        category: "Travel",
        status: { notIn: ["FAILED", "REMOVED"] },
      },
      orderBy: { createdAt: "asc" },
    });

    if (!travelWinner) {
      throw new Error("Run POST /api/rankings/run before the KYC cascade demo.");
    }

    await requestKyc(travelWinner.id);
    const firstFailure = await markFailed(travelWinner.id);

    if (!firstFailure.data.replacementWinner) {
      throw new Error("No first Travel replacement exists for the KYC cascade demo.");
    }

    await requestKyc(firstFailure.data.replacementWinner.id);
    const secondFailure = await markFailed(firstFailure.data.replacementWinner.id);

    if (!secondFailure.data.replacementWinner) {
      throw new Error("No second Travel replacement exists for the KYC cascade demo.");
    }

    console.log("KYC cascade completed successfully.");
    console.log(`First failed user: ${firstFailure.data.failedWinner.userId}`);
    console.log(`First replacement: ${firstFailure.data.replacementWinner.userId}`);
    console.log(`Second failed user: ${secondFailure.data.failedWinner.userId}`);
    console.log(`Second replacement: ${secondFailure.data.replacementWinner.userId}`);
  } finally {
    await disconnectDb();
  }
};

runKycCascade().catch((error) => {
  console.error("KYC cascade demo failed", error);
  process.exitCode = 1;
});
