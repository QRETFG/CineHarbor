import type { Movie, MovieSectionKey } from "../types/catalog";

interface ListMoviesParams {
  status?: string;
  section?: MovieSectionKey;
}

interface ListMoviesResponse {
  items: Movie[];
}

export async function listMovies(params: ListMoviesParams) {
  const searchParams = new URLSearchParams();

  if (params.status) {
    searchParams.set("status", params.status);
  }

  if (params.section) {
    searchParams.set("section", params.section);
  }

  const response = await fetch(`/api/movies?${searchParams.toString()}`);

  if (!response.ok) {
    throw new Error("加载影视数据失败");
  }

  return (await response.json()) as ListMoviesResponse;
}
