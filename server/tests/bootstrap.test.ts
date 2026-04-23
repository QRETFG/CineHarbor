// @vitest-environment node
import { existsSync, rmSync } from "node:fs";
import { join } from "node:path";
import { bootstrapApp } from "../src/db/bootstrap";

const rootDir = join(process.cwd(), ".tmp", "bootstrap-test");

afterEach(() => {
  rmSync(rootDir, { recursive: true, force: true });
});

test("bootstrap creates tables and storage directories", () => {
  const result = bootstrapApp({ rootDir });

  expect(result.tables).toEqual(["admins", "assets", "movie_sections", "movies"]);
  expect(existsSync(join(rootDir, "storage", "uploads", "posters"))).toBe(true);
  expect(existsSync(join(rootDir, "storage", "uploads", "backdrops"))).toBe(true);
  expect(existsSync(join(rootDir, "storage", "uploads", "site-assets"))).toBe(true);
});
