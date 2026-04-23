import { createConfig } from "../config";
import { createDatabase } from "../db/connection";

type MovieSectionKey = "featured" | "popular" | "recommended";

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
    sections: [] as MovieSectionKey[],
  };
}

function listSectionsByMovieId(
  rootDir: string | undefined,
  movieIds: number[]
): Map<number, MovieSectionKey[]> {
  const sectionsByMovieId = new Map<number, MovieSectionKey[]>();

  if (movieIds.length === 0) {
    return sectionsByMovieId;
  }

  const db = createDatabase(createConfig({ rootDir }));
  const placeholders = movieIds.map(() => "?").join(", ");
  const rows = db
    .prepare(
      `
        SELECT movie_id, section_key
        FROM movie_sections
        WHERE movie_id IN (${placeholders})
        ORDER BY sort_order ASC, id ASC
      `
    )
    .all(...movieIds) as Array<{ movie_id: number; section_key: MovieSectionKey }>;
  db.close();

  for (const row of rows) {
    const sections = sectionsByMovieId.get(row.movie_id) ?? [];
    sections.push(row.section_key);
    sectionsByMovieId.set(row.movie_id, sections);
  }

  return sectionsByMovieId;
}

export function listMovies({
  rootDir,
  status,
  section,
}: MovieContext & { status?: string; section?: string }) {
  const db = createDatabase(createConfig({ rootDir }));
  const clauses: string[] = [];
  const joins: string[] = [
    "LEFT JOIN assets AS poster_asset ON poster_asset.id = movies.poster_asset_id",
    "LEFT JOIN assets AS backdrop_asset ON backdrop_asset.id = movies.backdrop_asset_id",
  ];
  const joinParams: Array<string | number> = [];
  const whereParams: Array<string | number> = [];
  let orderBy = "movies.id ASC";

  if (section) {
    joins.push(
      "INNER JOIN movie_sections AS section_filter ON section_filter.movie_id = movies.id AND section_filter.section_key = ?"
    );
    joinParams.push(section);
    orderBy = "COALESCE(section_filter.sort_order, 0) ASC, movies.id ASC";
  }

  if (status) {
    clauses.push("movies.status = ?");
    whereParams.push(status);
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
        ${joins.join("\n")}
        ${where}
        ORDER BY ${orderBy}
      `
    )
    .all(...joinParams, ...whereParams) as Record<string, unknown>[];
  db.close();

  const movies = rows.map(mapMovie);
  const sectionsByMovieId = listSectionsByMovieId(
    rootDir,
    movies.map((movie) => Number(movie.id))
  );

  return movies.map((movie) => ({
    ...movie,
    sections: sectionsByMovieId.get(Number(movie.id)) ?? [],
  }));
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

  if (!row) {
    return null;
  }

  const movie = mapMovie(row);
  const sectionsByMovieId = listSectionsByMovieId(rootDir, [Number(movie.id)]);

  return {
    ...movie,
    sections: sectionsByMovieId.get(Number(movie.id)) ?? [],
  };
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
