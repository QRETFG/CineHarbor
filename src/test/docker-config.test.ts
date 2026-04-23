/// <reference types="node" />
// @vitest-environment node
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

test("docker deployment files expose the app on port 3001 with persistent storage", () => {
  const dockerfilePath = resolve(process.cwd(), "Dockerfile");
  const composePath = resolve(process.cwd(), "docker-compose.yml");
  const dockerignorePath = resolve(process.cwd(), ".dockerignore");
  const envExamplePath = resolve(process.cwd(), ".env.docker.example");
  const deployScriptPath = resolve(process.cwd(), "scripts", "docker-deploy.sh");

  expect(existsSync(dockerfilePath)).toBe(true);
  expect(existsSync(composePath)).toBe(true);
  expect(existsSync(dockerignorePath)).toBe(true);
  expect(existsSync(envExamplePath)).toBe(true);
  expect(existsSync(deployScriptPath)).toBe(true);

  const compose = readFileSync(composePath, "utf8");
  const deployScript = readFileSync(deployScriptPath, "utf8");

  expect(compose).toContain("3001:3001");
  expect(compose).toContain("./server/storage:/app/server/storage");
  expect(compose).toContain("unless-stopped");
  expect(deployScript).toContain("docker compose");
});
