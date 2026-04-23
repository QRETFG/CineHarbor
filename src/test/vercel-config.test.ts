/// <reference types="node" />
// @vitest-environment node
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

interface VercelConfig {
  rewrites?: Array<{
    source: string;
    destination: string;
  }>;
}

test("vercel config rewrites SPA routes to index.html", () => {
  const vercelConfigPath = resolve(process.cwd(), "vercel.json");

  expect(existsSync(vercelConfigPath)).toBe(true);

  const config = JSON.parse(
    readFileSync(vercelConfigPath, "utf8")
  ) as VercelConfig;

  expect(config.rewrites).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        source: "/(.*)",
        destination: "/index.html",
      }),
    ])
  );
});
