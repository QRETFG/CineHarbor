// @vitest-environment node
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { readFileSync, rmSync } from "node:fs";
import { join } from "node:path";

const execFileAsync = promisify(execFile);
const port = 33101;
const storageRoot = join(process.cwd(), "server", "storage");

afterEach(() => {
  rmSync(storageRoot, { recursive: true, force: true });
});

test("start:server boots the production server and responds to health checks", async () => {
  const packageJson = JSON.parse(
    readFileSync(join(process.cwd(), "package.json"), "utf8")
  ) as { scripts: Record<string, string> };

  const { stdout } = await execFileAsync(
    "bash",
    [
      "-lc",
      `
        set -euo pipefail
        log_file="$(mktemp)"
        trap 'if [ -n "\${pid:-}" ]; then kill "$pid" >/dev/null 2>&1 || true; wait "$pid" >/dev/null 2>&1 || true; fi; rm -f "$log_file"' EXIT
        SERVER_PORT=${port} COOKIE_SECRET=test-secret ${packageJson.scripts["start:server"]} >"$log_file" 2>&1 &
        pid=$!

        for _ in $(seq 1 40); do
          if curl -fsS "http://127.0.0.1:${port}/api/health"; then
            exit 0
          fi

          if ! kill -0 "$pid" >/dev/null 2>&1; then
            cat "$log_file"
            exit 1
          fi

          sleep 0.25
        done

        cat "$log_file"
        exit 1
      `,
    ],
    { cwd: process.cwd() }
  );

  expect(JSON.parse(stdout)).toEqual({ ok: true });
}, 15000);
