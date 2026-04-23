import { Router } from "express";
import multer from "multer";
import { createConfig } from "../config";
import { createAsset, deleteAsset, listAssets } from "../services/assetService";
import {
  createPublicUrl,
  createStoredName,
  getAssetDirectory,
  type AssetKind,
} from "../services/storageService";

interface AssetsRouterOptions {
  rootDir?: string;
}

function isAssetKind(value: string): value is AssetKind {
  return value === "poster" || value === "backdrop" || value === "site_asset";
}

export function createAssetsRouter({ rootDir }: AssetsRouterOptions = {}) {
  const config = createConfig({ rootDir });

  const storage = multer.diskStorage({
    destination(req, _file, callback) {
      const kind = req.body.kind;

      if (!isAssetKind(kind)) {
        callback(new Error("Invalid asset kind"), "");
        return;
      }

      callback(null, getAssetDirectory(config, kind));
    },
    filename(req, file, callback) {
      callback(null, createStoredName(file.originalname));
    },
  });

  const upload = multer({
    storage,
    limits: {
      fileSize: 5 * 1024 * 1024,
    },
    fileFilter(req, file, callback) {
      const kind = req.body.kind;

      if (!isAssetKind(kind)) {
        callback(new Error("Invalid asset kind"));
        return;
      }

      if (
        (kind === "poster" || kind === "backdrop") &&
        !file.mimetype.startsWith("image/")
      ) {
        callback(new Error("Image files are required for posters and backdrops"));
        return;
      }

      callback(null, true);
    },
  });

  const router = Router();

  router.get("/", (_req, res) => {
    res.json({ items: listAssets({ rootDir }) });
  });

  router.post("/", upload.single("file"), (req, res) => {
    if (!req.file || !isAssetKind(req.body.kind)) {
      res.status(400).json({ message: "File and valid asset kind are required" });
      return;
    }

    const asset = createAsset({
      rootDir,
      kind: req.body.kind,
      file: req.file,
      uploadedBy: req.session?.adminId,
      publicUrl: createPublicUrl(req.body.kind, req.file.filename),
    });

    res.status(201).json(asset);
  });

  router.delete("/:id", (req, res) => {
    const deleted = deleteAsset({ rootDir, id: req.params.id });

    if (deleted === "in_use") {
      res.status(409).json({ message: "Asset is still referenced by a movie" });
      return;
    }

    if (deleted === "not_found") {
      res.status(404).json({ message: "Asset not found" });
      return;
    }

    res.status(204).end();
  });

  return router;
}
