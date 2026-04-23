// @vitest-environment node
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import request from "supertest";
import { createApp } from "../src/app";

const rootDir = join(process.cwd(), ".tmp", "app-shell-test", "server");
const clientDistDir = join(rootDir, "..", "dist");

beforeEach(() => {
  mkdirSync(clientDistDir, { recursive: true });
  writeFileSync(
    join(clientDistDir, "index.html"),
    "<!doctype html><html><body>cineharbor-admin-shell</body></html>"
  );
});

afterEach(() => {
  rmSync(join(process.cwd(), ".tmp", "app-shell-test"), {
    recursive: true,
    force: true,
  });
});

test("serves the client app shell for admin routes", async () => {
  const response = await request(createApp({ rootDir })).get("/admin/login");

  expect(response.status).toBe(200);
  expect(response.text).toContain("cineharbor-admin-shell");
});
