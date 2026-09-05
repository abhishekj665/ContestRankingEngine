
CREATE SCHEMA IF NOT EXISTS "public";


CREATE TYPE "WinnerTier" AS ENUM ('GRAND', 'CONSISTENCY_1', 'CONSISTENCY_2', 'TOP_PERFORMER', 'CATEGORY_1ST', 'CATEGORY_2ND');


CREATE TYPE "WinnerStatus" AS ENUM ('PENDING_KYC', 'PASSED', 'FAILED', 'REMOVED');


CREATE TABLE "Winner" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tier" "WinnerTier" NOT NULL,
    "category" TEXT,
    "score" DOUBLE PRECISION NOT NULL,
    "status" "WinnerStatus" NOT NULL DEFAULT 'PENDING_KYC',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Winner_pkey" PRIMARY KEY ("id")
);


CREATE TABLE "RankingRun" (
    "id" TEXT NOT NULL,
    "runAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "snapshot" JSONB NOT NULL,

    CONSTRAINT "RankingRun_pkey" PRIMARY KEY ("id")
);


CREATE INDEX "Winner_tier_idx" ON "Winner"("tier");


CREATE INDEX "Winner_userId_idx" ON "Winner"("userId");


CREATE UNIQUE INDEX "Winner_tier_category_key" ON "Winner"("tier", "category");
