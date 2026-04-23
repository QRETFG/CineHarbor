import { useEffect, useState } from "react";
import MovieForm, { type MovieFormValues } from "../components/MovieForm";
import type { Movie, MovieSectionKey } from "../../types/catalog";

interface AssetItem {
  id: number;
  kind: string;
  originalName: string;
}

const emptyValues: MovieFormValues = {
  title: "",
  year: "",
  rating: "",
  genre: "",
  description: "",
  url: "",
  status: "published",
  posterAssetId: "",
  backdropAssetId: "",
  sections: ["popular"],
};

export default function MoviesPage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [assets, setAssets] = useState<AssetItem[]>([]);
  const [values, setValues] = useState<MovieFormValues>(emptyValues);
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null);

  async function loadMovies() {
    const response = await fetch("/api/movies", { credentials: "include" });
    const data = (await response.json()) as { items: Movie[] };
    setMovies(data.items);
  }

  async function loadAssets() {
    const response = await fetch("/api/assets", { credentials: "include" });
    const data = (await response.json()) as { items: AssetItem[] };
    setAssets(data.items);
  }

  useEffect(() => {
    void loadMovies();
    void loadAssets();
  }, []);

  async function saveMovie() {
    const payload = {
      title: values.title,
      year: Number(values.year),
      rating: Number(values.rating),
      genre: values.genre,
      description: values.description,
      url: values.url,
      status: values.status,
      posterAssetId: values.posterAssetId ? Number(values.posterAssetId) : null,
      backdropAssetId: values.backdropAssetId
        ? Number(values.backdropAssetId)
        : null,
      sections: values.sections.map((sectionKey, sortOrder) => ({
        sectionKey,
        sortOrder,
      })),
    };

    const targetUrl = editingMovie ? `/api/movies/${editingMovie.id}` : "/api/movies";
    const method = editingMovie ? "PUT" : "POST";

    await fetch(targetUrl, {
      method,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    setValues(emptyValues);
    setEditingMovie(null);
    await loadMovies();
  }

  async function removeMovie(id: number) {
    await fetch(`/api/movies/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    await loadMovies();
  }

  function beginEdit(movie: Movie) {
    setEditingMovie(movie);
    setValues({
      title: movie.title,
      year: String(movie.year),
      rating: String(movie.rating),
      genre: movie.genre,
      description: movie.description,
      url: movie.url,
      status: movie.status ?? "draft",
      posterAssetId: movie.posterAssetId ? String(movie.posterAssetId) : "",
      backdropAssetId: movie.backdropAssetId ? String(movie.backdropAssetId) : "",
      sections: (movie.sections as MovieSectionKey[] | undefined) ?? ["popular"],
    });
  }

  return (
    <div className="space-y-6">
      <MovieForm
        assets={assets}
        editingMovie={editingMovie}
        onChange={setValues}
        onSubmit={() => void saveMovie()}
        values={values}
      />

      <section className="sketch-border bg-surface p-5 shadow-sketch">
        <h1 className="font-hand text-3xl font-bold">影视管理</h1>
        <div className="mt-4 space-y-3">
          {movies.length === 0 ? (
            <p className="font-body text-pencil/60">暂无影视数据。</p>
          ) : (
            movies.map((movie) => (
              <article
                key={movie.id}
                className="flex items-center justify-between gap-4 sketch-border-thin bg-paper px-4 py-3"
              >
                <div>
                  <h2 className="font-hand text-xl font-bold">{movie.title}</h2>
                  <p className="font-body text-sm text-pencil/60">
                    {movie.year} · {movie.genre}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    className="sketch-border-thin px-3 py-1 font-body"
                    onClick={() => beginEdit(movie)}
                    type="button"
                  >
                    编辑
                  </button>
                  <button
                    className="sketch-border-thin px-3 py-1 font-body"
                    onClick={() => void removeMovie(movie.id)}
                    type="button"
                  >
                    删除
                  </button>
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
