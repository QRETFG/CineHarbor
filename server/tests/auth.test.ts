// @vitest-environment node
import { rmSync } from "node:fs";
import { join } from "node:path";
import request from "supertest";
import { createApp } from "../src/app";
import { bootstrapApp } from "../src/db/bootstrap";
import { createAdmin } from "../src/services/authService";

const rootDir = join(process.cwd(), ".tmp", "auth-test");

beforeEach(() => {
  bootstrapApp({ rootDir });
  createAdmin({ rootDir, username: "admin", password: "secret123" });
});

afterEach(() => {
  rmSync(rootDir, { recursive: true, force: true });
});

test("login returns 204 and sets a session cookie", async () => {
  const response = await request(createApp({ rootDir }))
    .post("/api/auth/login")
    .send({ username: "admin", password: "secret123" });

  expect(response.status).toBe(204);
  expect(response.headers["set-cookie"]).toBeDefined();
});

test("protected admin route returns 401 without login", async () => {
  const response = await request(createApp({ rootDir })).get(
    "/api/admin/dashboard"
  );

  expect(response.status).toBe(401);
});
