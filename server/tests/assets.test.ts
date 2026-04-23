// @vitest-environment node
import { rmSync } from "node:fs";
import { join } from "node:path";
import request from "supertest";
import { createApp } from "../src/app";
import { bootstrapApp } from "../src/db/bootstrap";
import { createAdmin } from "../src/services/authService";

const rootDir = join(process.cwd(), ".tmp", "assets-test");

beforeEach(() => {
  bootstrapApp({ rootDir });
  createAdmin({ rootDir, username: "admin", password: "secret123" });
});

afterEach(() => {
  rmSync(rootDir, { recursive: true, force: true });
});

test("uploads a poster asset and returns metadata", async () => {
  const agent = request.agent(createApp({ rootDir }));

  await agent
    .post("/api/auth/login")
    .send({ username: "admin", password: "secret123" });

  const response = await agent
    .post("/api/assets")
    .field("kind", "poster")
    .attach("file", Buffer.from("fake-image"), {
      filename: "poster.jpg",
      contentType: "image/jpeg",
    });

  expect(response.status).toBe(201);
  expect(response.body.kind).toBe("poster");
  expect(response.body.publicUrl).toMatch(/\/uploads\/posters\//);
});
