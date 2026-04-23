// @vitest-environment node
import request from "supertest";
import { createApp } from "../src/app";

test("GET /api/health returns ok", async () => {
  const response = await request(createApp()).get("/api/health");

  expect(response.status).toBe(200);
  expect(response.body).toEqual({ ok: true });
});
