import { createConfig } from "../config";
import { createDatabase } from "../db/connection";

interface MovieContext {
  rootDir?: string;
}

interface MovieSectionInput {
  sectionKey: string;
  sortOrder: number;
}

interface SaveMovieInput extends MovieContext {
  id?: number;
  title: string;
  year: number;
  rating: number;
  genre: string;
  description: string;
  url: string;
  posterAssetId?: number | null;
  backdropAssetId?: number | null;
  status?: string;
  sections?: MovieSectionInput[];
}

function mapMovie(row: Record<string, unknown>) {
  return {
    id: row.id,
    title: row.title,
    year: row.year,
    rating: row.rating,
    genre: row.genre,
    description: row.description,
    url: row.external_url,
    poster: row.poster_url ?? "",
    backdrop: row.backdrop_url ?? "",
    posterAssetId: row.poster_asset_id,
    backdropAssetId: row.backdrop_asset_id,
    status: row.status,
  };
}

export function listMovies({
  rootDir,
  status,
  section,
}: MovieContext & { status?: string; section?: string }) {
  const db = createDatabase(createConfig({ rootDir }));
  const clauses: string[] = [];
  const params: Array<string | number> = [];

  if (status) {
    clauses.push("movies.status = ?");
    params.push(status);
  }

  if (section) {
    clauses.push("movie_sections.section_key = ?");
    params.push(section);
  }

  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  const rows = db
    .prepare(
      `
        SELECT
          movies.*,
          poster_asset.public_url AS poster_url,
          backdrop_asset.public_url AS backdrop_url
        FROM movies
        LEFT JOIN movie_sections ON movie_sections.movie_id = movies.id
        LEFT JOIN assets AS poster_asset ON poster_asset.id = movies.poster_asset_id
        LEFT JOIN assets AS backdrop_asset ON backdrop_asset.id = movies.backdrop_asset_id
        ${where}
        ORDER BY COALESCE(movie_sections.sort_order, 0) ASC, movies.id ASC
      `
    )
    .all(...params) as Record<string, unknown>[];
  db.close();

  return rows.map(mapMovie);
}

export function getMovieById({
  rootDir,
  id,
}: MovieContext & { id: number | string }) {
  const db = createDatabase(createConfig({ rootDir }));
  const row = db
    .prepare(
      `
        SELECT
          movies.*,
          poster_asset.public_url AS poster_url,
          backdrop_asset.public_url AS backdrop_url
        FROM movies
        LEFT JOIN assets AS poster_asset ON poster_asset.id = movies.poster_asset_id
        LEFT JOIN assets AS backdrop_asset ON backdrop_asset.id = movies.backdrop_asset_id
        WHERE movies.id = ?
      `
    )
    .get(id) as Record<string, unknown> | undefined;
  db.close();

  return row ? mapMovie(row) : null;
}

function replaceSections(
  rootDir: string | undefined,
  movieId: number,
  sections: MovieSectionInput[] = []
) {
  const db = createDatabase(createConfig({ rootDir }));
  db.prepare("DELETE FROM movie_sections WHERE movie_id = ?").run(movieId);

  for (const section of sections) {
    db.prepare(
      `
        INSERT INTO movie_sections (movie_id, section_key, sort_order)
        VALUES (?, ?, ?)
      `
    ).run(movieId, section.sectionKey, section.sortOrder);
  }

  db.close();
}

export function saveMovie(input: SaveMovieInput) {
  const db = createDatabase(createConfig({ rootDir: input.rootDir }));

  if (input.id) {
    db.prepare(
      `
        UPDATE movies
        SET
          title = ?,
          year = ?,
          rating = ?,
          genre = ?,
          description = ?,
          external_url = ?,
          poster_asset_id = ?,
          backdrop_asset_id = ?,
          status = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `
    ).run(
      input.title,
      input.year,
      input.rating,
      input.genre,
      input.description,
      input.url,
      input.posterAssetId ?? null,
      input.backdropAssetId ?? null,
      input.status ?? "draft",
      input.id
    );
    db.close();
    replaceSections(input.rootDir, input.id, input.sections);
    return getMovieById({ rootDir: input.rootDir, id: input.id });
  }

  const result = db
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
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `
    )
    .run(
      input.title,
      input.year,
      input.rating,
      input.genre,
      input.description,
      input.url,
      input.posterAssetId ?? null,
      input.backdropAssetId ?? null,
      input.status ?? "draft"
    );
  const movieId = Number(result.lastInsertRowid);
  db.close();
  replaceSections(input.rootDir, movieId, input.sections);

  return getMovieById({ rootDir: input.rootDir, id: movieId });
}

export function deleteMovie({
  rootDir,
  id,
}: MovieContext & { id: number | string }) {
  const db = createDatabase(createConfig({ rootDir }));
  db.prepare("DELETE FROM movie_sections WHERE movie_id = ?").run(id);
  const result = db.prepare("DELETE FROM movies WHERE id = ?").run(id);
  db.close();
  return result.changes > 0;
}

export function assetIsReferenced({
  rootDir,
  assetId,
}: MovieContext & { assetId: number | string }) {
  const db = createDatabase(createConfig({ rootDir }));
  const record = db
    .prepare(
      `
        SELECT id
        FROM movies
        WHERE poster_asset_id = ? OR backdrop_asset_id = ?
        LIMIT 1
      `
    )
    .get(assetId, assetId);
  db.close();

  return Boolean(record);
}
