import assert from "node:assert/strict";
import test from "node:test";

process.env.DATABASE_URL = "postgresql://user:password@localhost:5432/admin";
process.env.JWT_SECRET = "test-secret";
process.env.USER_SERVICE_URL = "http://localhost:8000";

const { default: app } = await import("../src/app.js");

test("admin app loads", () => {
  assert.equal(typeof app, "function");
});
