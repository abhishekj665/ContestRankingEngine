DROP INDEX "Winner_tier_category_key";

ALTER TABLE "Winner" ADD COLUMN "rankingRunId" TEXT;

CREATE INDEX "Winner_rankingRunId_idx" ON "Winner"("rankingRunId");

ALTER TABLE "Winner"
ADD CONSTRAINT "Winner_rankingRunId_fkey"
FOREIGN KEY ("rankingRunId") REFERENCES "RankingRun"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
