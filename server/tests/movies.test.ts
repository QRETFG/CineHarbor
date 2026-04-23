// @vitest-environment node
import { rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import request from "supertest";
import { createApp } from "../src/app";
import { createConfig } from "../src/config";
import { createDatabase } from "../src/db/connection";
import { bootstrapApp } from "../src/db/bootstrap";
import { createAdmin } from "../src/services/authService";

const rootDir = join(process.cwd(), ".tmp", "movies-test");

beforeEach(() => {
  bootstrapApp({ rootDir });
  createAdmin({ rootDir, username: "admin", password: "secret123" });
});

afterEach(() => {
  rmSync(rootDir, { recursive: true, force: true });
});

test("lists published featured movies by section", async () => {
  const config = createConfig({ rootDir });
  const db = createDatabase(config);
  const movie = db
    .prepare(
      `
        INSERT INTO movies (
          title,
          year,
          rating,
          genre,
          description,
          external_url,
          status
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `
    )
    .run(
      "测试电影",
      2024,
      8.8,
      "科幻",
      "测试描述",
      "https://example.com/movie",
      "published"
    );

  db.prepare(
    `
      INSERT INTO movie_sections (movie_id, section_key, sort_order)
      VALUES (?, ?, ?)
    `
  ).run(movie.lastInsertRowid, "featured", 1);
  db.close();

  const response = await request(createApp({ rootDir })).get(
    "/api/movies?status=published&section=featured"
  );

  expect(response.status).toBe(200);
  expect(response.body.items[0].title).toBe("测试电影");
});

test("rejects deleting an asset referenced by a movie", async () => {
  const config = createConfig({ rootDir });
  const filePath = join(config.uploadDirs.posters, "poster.jpg");
  writeFileSync(filePath, "fake-image");

  const db = createDatabase(config);
  const asset = db
    .prepare(
      `
        INSERT INTO assets (
          kind,
          original_name,
          stored_name,
          mime_type,
          size_bytes,
          storage_path,
          public_url
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `
    )
    .run(
      "poster",
      "poster.jpg",
      "poster.jpg",
      "image/jpeg",
      10,
      filePath,
      "/uploads/posters/poster.jpg"
    );

  db.prepare(
    `
      INSERT INTO movies (
        title,
        year,
        rating,
        genre,
        description,
        external_url,
        poster_asset_id,
        status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `
  ).run(
    "测试电影",
    2024,
    8.8,
    "科幻",
    "测试描述",
    "https://example.com/movie",
    asset.lastInsertRowid,
    "published"
  );
  db.close();

  const agent = request.agent(createApp({ rootDir }));
  await agent
    .post("/api/auth/login")
    .send({ username: "admin", password: "secret123" });

  const response = await agent.delete(`/api/assets/${asset.lastInsertRowid}`);

  expect(response.status).toBe(409);
});
