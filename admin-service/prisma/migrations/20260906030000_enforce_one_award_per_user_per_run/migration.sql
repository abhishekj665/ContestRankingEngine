-- A ranking run may award a creator once only.  This database constraint also
-- protects KYC replacement allocation when two administrators act concurrently.
CREATE UNIQUE INDEX "Winner_rankingRunId_userId_key" ON "Winner"("rankingRunId", "userId");
