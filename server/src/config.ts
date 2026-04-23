import { resolve } from "node:path";

export interface AppConfig {
  rootDir: string;
  port: number;
  cookieSecret: string;
  sqlitePath: string;
  uploadRoot: string;
  dataRoot: string;
  uploadDirs: {
    posters: string;
    backdrops: string;
    siteAssets: string;
  };
}

interface ConfigOverrides {
  rootDir?: string;
}

export function createConfig(overrides: ConfigOverrides = {}): AppConfig {
  const rootDir = overrides.rootDir ?? resolve(process.cwd(), "server");
  const port = Number(process.env.SERVER_PORT ?? 3001);
  const dataRoot = resolve(rootDir, "storage", "data");
  const uploadRoot = resolve(rootDir, "storage", "uploads");

  return {
    rootDir,
    port,
    cookieSecret: process.env.COOKIE_SECRET ?? "change-me",
    dataRoot,
    uploadRoot,
    sqlitePath: resolve(dataRoot, "cineharbor.sqlite"),
    uploadDirs: {
      posters: resolve(uploadRoot, "posters"),
      backdrops: resolve(uploadRoot, "backdrops"),
      siteAssets: resolve(uploadRoot, "site-assets"),
    },
  };
}
