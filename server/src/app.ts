import { existsSync } from "node:fs";
import express from "express";
import cookieSession from "cookie-session";
import { createConfig } from "./config";
import { bootstrapApp } from "./db/bootstrap";
import { errorHandler } from "./middleware/errorHandler";
import { requireAdmin } from "./middleware/requireAdmin";
import { adminRouter } from "./routes/admin";
import { createAssetsRouter } from "./routes/assets";
import { createAuthRouter } from "./routes/auth";
import { healthRouter } from "./routes/health";
import { createMoviesRouter } from "./routes/movies";
import { seedAdminFromEnv } from "./services/authService";

interface CreateAppOptions {
  rootDir?: string;
}

export function createApp(options: CreateAppOptions = {}) {
  const config = createConfig(options);
  bootstrapApp(options);
  seedAdminFromEnv({ rootDir: config.rootDir });
  const app = express();
  const hasClientIndex = existsSync(config.clientIndexPath);

  app.use(express.json());
  app.use(
    cookieSession({
      name: "cineharbor_session",
      secret: config.cookieSecret,
      httpOnly: true,
      sameSite: "lax",
    })
  );
  app.use("/api/health", healthRouter);
  app.use("/api/auth", createAuthRouter({ rootDir: config.rootDir }));
  app.use("/api/admin", requireAdmin, adminRouter);
  app.use("/api/assets", requireAdmin, createAssetsRouter({ rootDir: config.rootDir }));
  app.use("/api/movies", createMoviesRouter({ rootDir: config.rootDir }));
  app.use("/uploads", express.static(config.uploadRoot));

  if (hasClientIndex) {
    app.use(express.static(config.clientDistPath));
    app.get(/^(?!\/api(?:\/|$)|\/uploads(?:\/|$)).*/, (_req, res) => {
      res.sendFile("index.html", { root: config.clientDistPath });
    });
  }

  app.use(errorHandler);

  return app;
}
