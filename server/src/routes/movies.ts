import { Router } from "express";
import { requireAdmin } from "../middleware/requireAdmin";
import { deleteMovie, getMovieById, listMovies, saveMovie } from "../services/movieService";

interface MoviesRouterOptions {
  rootDir?: string;
}

export function createMoviesRouter({ rootDir }: MoviesRouterOptions = {}) {
  const router = Router();

  router.get("/", (req, res) => {
    res.json({
      items: listMovies({
        rootDir,
        status:
          typeof req.query.status === "string" ? req.query.status : undefined,
        section:
          typeof req.query.section === "string" ? req.query.section : undefined,
      }),
    });
  });

  router.get("/:id", (req, res) => {
    const movieId = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;
    const movie = getMovieById({ rootDir, id: movieId });

    if (!movie) {
      res.status(404).json({ message: "Movie not found" });
      return;
    }

    res.json(movie);
  });

  router.post("/", requireAdmin, (req, res) => {
    const movie = saveMovie({ rootDir, ...req.body });
    res.status(201).json(movie);
  });

  router.put("/:id", requireAdmin, (req, res) => {
    const movieId = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;
    const movie = saveMovie({ rootDir, id: Number(movieId), ...req.body });
    res.json(movie);
  });

  router.delete("/:id", requireAdmin, (req, res) => {
    const movieId = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;
    const deleted = deleteMovie({ rootDir, id: movieId });

    if (!deleted) {
      res.status(404).json({ message: "Movie not found" });
      return;
    }

    res.status(204).end();
  });

  return router;
}
