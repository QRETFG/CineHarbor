import bcrypt from "bcryptjs";
import type Database from "better-sqlite3";
import { createConfig } from "../config";
import { createDatabase } from "../db/connection";

interface AuthContext {
  rootDir?: string;
}

interface AdminCredentials extends AuthContext {
  username: string;
  password: string;
}

interface AdminRecord {
  id: number;
  username: string;
  password_hash: string;
}

function readAdmin(
  db: Database.Database,
  username: string
): AdminRecord | undefined {
  return db
    .prepare(
      "SELECT id, username, password_hash FROM admins WHERE username = ? LIMIT 1"
    )
    .get(username) as AdminRecord | undefined;
}

export function createAdmin({ rootDir, username, password }: AdminCredentials) {
  const db = createDatabase(createConfig({ rootDir }));
  const passwordHash = bcrypt.hashSync(password, 10);

  db.prepare(
    `
      INSERT INTO admins (username, password_hash)
      VALUES (?, ?)
      ON CONFLICT(username) DO UPDATE SET
        password_hash = excluded.password_hash,
        updated_at = CURRENT_TIMESTAMP
    `
  ).run(username, passwordHash);

  const admin = readAdmin(db, username);
  db.close();

  if (!admin) {
    throw new Error("Failed to create admin");
  }

  return { id: admin.id, username: admin.username };
}

export function seedAdminFromEnv({ rootDir }: AuthContext = {}) {
  const username = process.env.ADMIN_SEED_USERNAME?.trim();
  const password = process.env.ADMIN_SEED_PASSWORD?.trim();

  if (!username || !password) {
    return null;
  }

  return createAdmin({ rootDir, username, password });
}

export function verifyCredentials({
  rootDir,
  username,
  password,
}: AdminCredentials) {
  const db = createDatabase(createConfig({ rootDir }));
  const admin = readAdmin(db, username);
  db.close();

  if (!admin || !bcrypt.compareSync(password, admin.password_hash)) {
    return null;
  }

  return { id: admin.id, username: admin.username };
}

export function getAdminById({
  rootDir,
  id,
}: AuthContext & { id: number | undefined }) {
  if (!id) return null;

  const db = createDatabase(createConfig({ rootDir }));
  const admin = db
    .prepare("SELECT id, username FROM admins WHERE id = ? LIMIT 1")
    .get(id) as { id: number; username: string } | undefined;
  db.close();

  return admin ?? null;
}
