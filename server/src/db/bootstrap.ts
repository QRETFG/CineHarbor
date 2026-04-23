import { mkdirSync } from "node:fs";
import { createConfig } from "../config";
import { createDatabase } from "./connection";
import { initializeSchema, TABLES } from "./schema";

interface BootstrapOptions {
  rootDir?: string;
}

export function bootstrapApp(options: BootstrapOptions = {}) {
  const config = createConfig(options);

  mkdirSync(config.dataRoot, { recursive: true });
  mkdirSync(config.uploadDirs.posters, { recursive: true });
  mkdirSync(config.uploadDirs.backdrops, { recursive: true });
  mkdirSync(config.uploadDirs.siteAssets, { recursive: true });

  const db = createDatabase(config);
  initializeSchema(db);
  db.close();

  return {
    config,
    tables: [...TABLES],
  };
}
