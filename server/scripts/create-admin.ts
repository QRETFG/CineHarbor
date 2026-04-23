import "dotenv/config";
import { bootstrapApp } from "../src/db/bootstrap";
import { createAdmin } from "../src/services/authService";

const rootDir = process.cwd().endsWith("/server")
  ? process.cwd()
  : `${process.cwd()}/server`;

const username = process.env.ADMIN_SEED_USERNAME;
const password = process.env.ADMIN_SEED_PASSWORD;

if (!username || !password) {
  console.error("ADMIN_SEED_USERNAME and ADMIN_SEED_PASSWORD are required");
  process.exit(1);
}

bootstrapApp({ rootDir });
const admin = createAdmin({ rootDir, username, password });

console.log(`Admin ready: ${admin.username} (#${admin.id})`);
