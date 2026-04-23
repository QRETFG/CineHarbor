import { Router } from "express";
import { getAdminById, verifyCredentials } from "../services/authService";

interface AuthRouterOptions {
  rootDir?: string;
}

export function createAuthRouter({ rootDir }: AuthRouterOptions = {}) {
  const router = Router();

  router.post("/login", (req, res) => {
    const admin = verifyCredentials({
      rootDir,
      username: req.body.username ?? "",
      password: req.body.password ?? "",
    });

    if (!admin) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    req.session = req.session ?? {};
    req.session.adminId = admin.id;
    res.status(204).end();
  });

  router.post("/logout", (req, res) => {
    req.session = null;
    res.status(204).end();
  });

  router.get("/me", (req, res) => {
    const admin = getAdminById({ rootDir, id: req.session?.adminId });

    if (!admin) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    res.json(admin);
  });

  return router;
}
