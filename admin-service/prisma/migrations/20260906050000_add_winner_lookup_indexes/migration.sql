CREATE INDEX "Winner_rankingRunId_status_idx" ON "Winner"("rankingRunId", "status");
CREATE INDEX "Winner_rankingRunId_tier_category_status_idx" ON "Winner"("rankingRunId", "tier", "category", "status");
