import type { RequestHandler } from "express";

export const requireAdmin: RequestHandler = (req, res, next) => {
  if (!req.session?.adminId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  next();
};
