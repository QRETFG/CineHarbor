import { Router } from "express";

export const adminRouter = Router();

adminRouter.get("/dashboard", (_req, res) => {
  res.json({
    movieCount: 0,
    assetCount: 0,
    recentUploads: [],
    recentMovies: [],
  });
});
