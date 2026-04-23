import express from "express";
import cookieSession from "cookie-session";
import { createConfig } from "./config";
import { bootstrapApp } from "./db/bootstrap";
import { requireAdmin } from "./middleware/requireAdmin";
import { adminRouter } from "./routes/admin";
import { createAuthRouter } from "./routes/auth";
import { healthRouter } from "./routes/health";

interface CreateAppOptions {
  rootDir?: string;
}

export function createApp(options: CreateAppOptions = {}) {
  const config = createConfig(options);
  bootstrapApp(options);
  const app = express();

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

  return app;
}
