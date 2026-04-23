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

      if (url.pathname === "/api/assets") {
        return {
          ok: true,
          async json() {
            return { items: [] };
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

test("shows poster upload and site asset upload entries", async () => {
  const router = createMemoryRouter(routes, { initialEntries: ["/admin/assets"] });

  render(<RouterProvider router={router} />);

  expect(await screen.findByRole("heading", { name: /素材库/i })).toBeInTheDocument();
  expect(await screen.findByText(/上传前端素材/i)).toBeInTheDocument();
});
