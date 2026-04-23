import { extname } from "node:path";
import crypto from "node:crypto";
import type { AppConfig } from "../config";

export type AssetKind = "poster" | "backdrop" | "site_asset";

export function getAssetSubdirectory(kind: AssetKind) {
  switch (kind) {
    case "poster":
      return "posters";
    case "backdrop":
      return "backdrops";
    case "site_asset":
      return "site-assets";
  }
}

export function getAssetDirectory(config: AppConfig, kind: AssetKind) {
  switch (kind) {
    case "poster":
      return config.uploadDirs.posters;
    case "backdrop":
      return config.uploadDirs.backdrops;
    case "site_asset":
      return config.uploadDirs.siteAssets;
  }
}

export function createStoredName(originalName: string) {
  const extension = extname(originalName) || ".bin";
  return `${Date.now()}-${crypto.randomUUID()}${extension}`;
}

export function createPublicUrl(kind: AssetKind, storedName: string) {
  return `/uploads/${getAssetSubdirectory(kind)}/${storedName}`;
}
