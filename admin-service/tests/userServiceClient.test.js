import assert from "node:assert/strict";
import http from "node:http";
import test, { after } from "node:test";

const requests = [];

const server = http.createServer((req, res) => {
  requests.push({ path: req.url, internalKey: req.headers["x-internal-key"] });
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify({ success: true, data: req.url }));
});

await new Promise((resolve) => server.listen(0, resolve));

const { port } = server.address();
process.env.USER_SERVICE_URL = `http://127.0.0.1:${port}`;
process.env.INTERNAL_SERVICE_KEY = "test-internal-key";

const {
  fetchEligibleUsers,
  fetchScoredPosts,
  fetchWeeklyTopThree,
} = await import("../src/clients/userServiceClient.js");

after(() => server.close());

test("User Service client fetches internal ranking data", async () => {
  const scoredPosts = await fetchScoredPosts();
  const eligibleUsers = await fetchEligibleUsers();
  const weeklyTopThree = await fetchWeeklyTopThree();

  assert.equal(scoredPosts.data, "/internal/scored-posts");
  assert.equal(eligibleUsers.data, "/internal/eligible-users");
  assert.equal(weeklyTopThree.data, "/internal/weekly-top-three");
  assert.deepEqual(requests, [
    { path: "/internal/scored-posts", internalKey: "test-internal-key" },
    { path: "/internal/eligible-users", internalKey: "test-internal-key" },
    { path: "/internal/weekly-top-three", internalKey: "test-internal-key" },
  ]);
});
