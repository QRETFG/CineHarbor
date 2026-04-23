import { useEffect, useState } from "react";
import { listMovies } from "../lib/api";
import type { Movie, MovieSectionKey } from "../types/catalog";

export function useMovieSection(section: MovieSectionKey) {
  const [items, setItems] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    setLoading(true);
    void listMovies({ status: "published", section })
      .then((response) => {
        if (!active) return;
        setItems(response.items);
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [section]);

  return { items, loading };
}
