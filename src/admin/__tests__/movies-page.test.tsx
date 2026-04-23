import { render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { vi } from "vitest";
import { routes } from "../../router";

beforeEach(() => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: string | URL | Request) => {
      const rawUrl =
        typeof input === "string"
          ? input
          : input instanceof URL
            ? input.toString()
            : input.url;
      const url = new URL(rawUrl, "http://localhost");

      if (url.pathname === "/api/auth/me") {
        return {
          ok: true,
          async json() {
            return { id: 1, username: "admin" };
          },
        };
      }

      if (url.pathname === "/api/movies") {
        return {
          ok: true,
          async json() {
            return { items: [] };
          },
        };
      }

      if (url.pathname === "/api/assets") {
        return {
          ok: true,
          async json() {
            return { items: [] };
          },
        };
      }

      if (url.pathname === "/api/admin/dashboard") {
        return {
          ok: true,
          async json() {
            return {
              movieCount: 0,
              assetCount: 0,
              recentUploads: [],
              recentMovies: [],
            };
          },
        };
      }

      return {
        ok: true,
        async json() {
          return {};
        },
      };
    })
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});

test("creates a movie from the admin page", async () => {
  const router = createMemoryRouter(routes, { initialEntries: ["/admin/movies"] });

  render(<RouterProvider router={router} />);

  expect(
    await screen.findByRole("heading", { name: /影视管理/i })
  ).toBeInTheDocument();
  expect(
    await screen.findByRole("button", { name: /保存影视/i })
  ).toBeInTheDocument();
});
