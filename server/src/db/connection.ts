import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import type { AppConfig } from "../config";

export function createDatabase(config: AppConfig) {
  mkdirSync(config.dataRoot, { recursive: true });
  return new Database(config.sqlitePath);
}
