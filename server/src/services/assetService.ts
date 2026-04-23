import { unlinkSync } from "node:fs";
import { createConfig } from "../config";
import { createDatabase } from "../db/connection";
import { assetIsReferenced } from "./movieService";
import type { AssetKind } from "./storageService";

interface AssetContext {
  rootDir?: string;
}

interface AssetRecord {
  id: number;
  kind: string;
  original_name: string;
  stored_name: string;
  mime_type: string;
  size_bytes: number;
  storage_path: string;
  public_url: string;
  uploaded_by: number | null;
  created_at: string;
}

interface CreateAssetInput extends AssetContext {
  kind: AssetKind;
  file: Express.Multer.File;
  uploadedBy?: number;
  publicUrl: string;
}

function mapAsset(record: AssetRecord) {
  return {
    id: record.id,
    kind: record.kind,
    originalName: record.original_name,
    storedName: record.stored_name,
    mimeType: record.mime_type,
    sizeBytes: record.size_bytes,
    storagePath: record.storage_path,
    publicUrl: record.public_url,
    uploadedBy: record.uploaded_by,
    createdAt: record.created_at,
  };
}

export function createAsset({
  rootDir,
  kind,
  file,
  uploadedBy,
  publicUrl,
}: CreateAssetInput) {
  const db = createDatabase(createConfig({ rootDir }));
  const result = db
    .prepare(
      `
        INSERT INTO assets (
          kind,
          original_name,
          stored_name,
          mime_type,
          size_bytes,
          storage_path,
          public_url,
          uploaded_by
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `
    )
    .run(
      kind,
      file.originalname,
      file.filename,
      file.mimetype,
      file.size,
      file.path,
      publicUrl,
      uploadedBy ?? null
    );

  const record = db
    .prepare("SELECT * FROM assets WHERE id = ?")
    .get(result.lastInsertRowid) as AssetRecord;
  db.close();

  return mapAsset(record);
}

export function listAssets({ rootDir }: AssetContext = {}) {
  const db = createDatabase(createConfig({ rootDir }));
  const rows = db
    .prepare("SELECT * FROM assets ORDER BY created_at DESC, id DESC")
    .all() as AssetRecord[];
  db.close();

  return rows.map(mapAsset);
}

export function deleteAsset({
  rootDir,
  id,
}: AssetContext & { id: number | string }) {
  if (assetIsReferenced({ rootDir, assetId: id })) {
    return "in_use" as const;
  }

  const db = createDatabase(createConfig({ rootDir }));
  const record = db
    .prepare("SELECT * FROM assets WHERE id = ?")
    .get(id) as AssetRecord | undefined;

  if (!record) {
    db.close();
    return "not_found" as const;
  }

  db.prepare("DELETE FROM assets WHERE id = ?").run(id);
  db.close();
  unlinkSync(record.storage_path);

  return "deleted" as const;
}
