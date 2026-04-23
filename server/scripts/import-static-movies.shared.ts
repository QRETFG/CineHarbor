import "dotenv/config";
import { basename } from "node:path";
import { bootstrapApp } from "../src/db/bootstrap";
import { createConfig } from "../src/config";
import { createDatabase } from "../src/db/connection";
import { featuredMovies, popularMovies, recommendedMovies } from "../../src/data/movies";

const rootDir = process.cwd().endsWith("/server")
  ? process.cwd()
  : `${process.cwd()}/server`;

type StaticMovie = (typeof featuredMovies)[number];

function ensureAsset(db: ReturnType<typeof createDatabase>, kind: string, publicUrl: string) {
  if (!publicUrl) return null;

  const existing = db
    .prepare("SELECT id FROM assets WHERE public_url = ? LIMIT 1")
    .get(publicUrl) as { id: number } | undefined;

  if (existing) return existing.id;

  const filename = basename(publicUrl);
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
          public_url
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `
    )
    .run(kind, filename, filename, "image/jpeg", 0, publicUrl, publicUrl);

  return Number(result.lastInsertRowid);
}

function upsertMovie(
  db: ReturnType<typeof createDatabase>,
  movie: StaticMovie,
  sectionKey: string,
  sortOrder: number
) {
  const existing = db
    .prepare("SELECT id FROM movies WHERE title = ? AND year = ? LIMIT 1")
    .get(movie.title, movie.year) as { id: number } | undefined;

  const posterAssetId = ensureAsset(db, "poster", movie.poster);
  const backdropAssetId = ensureAsset(db, "backdrop", movie.backdrop);
  const movieId = existing?.id
    ? existing.id
    : Number(
        db
          .prepare(
            `
              INSERT INTO movies (
                title,
                year,
                rating,
                genre,
                description,
                external_url,
                poster_asset_id,
                backdrop_asset_id,
                status
              )
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'published')
            `
          )
          .run(
            movie.title,
            movie.year,
            movie.rating,
            movie.genre,
            movie.description,
            movie.url,
            posterAssetId,
            backdropAssetId
          ).lastInsertRowid
      );

  db.prepare(
    `
      INSERT OR REPLACE INTO movie_sections (movie_id, section_key, sort_order)
      VALUES (?, ?, ?)
    `
  ).run(movieId, sectionKey, sortOrder);
}

export async function importStaticMovies() {
  bootstrapApp({ rootDir });
  const db = createDatabase(createConfig({ rootDir }));
  const sections = [
    { key: "featured", items: featuredMovies },
    { key: "popular", items: popularMovies },
    { key: "recommended", items: recommendedMovies },
  ];

  for (const section of sections) {
    section.items.forEach((movie, index) => {
      upsertMovie(db, movie, section.key, index);
    });
  }

  db.close();
  console.log("Imported static movies");
}
