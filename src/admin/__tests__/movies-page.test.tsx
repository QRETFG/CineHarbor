import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { vi } from "vitest";
import { routes } from "../../router";

beforeEach(() => {
  const movies: Array<Record<string, unknown>> = [];

  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: string | URL | Request, init?: RequestInit) => {
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
        if ((init?.method ?? "GET").toUpperCase() === "POST") {
          const body = JSON.parse(String(init?.body ?? "{}")) as Record<string, unknown>;
          movies.push({
            id: movies.length + 1,
            ...body,
          });

          return {
            ok: true,
            async json() {
              return movies[movies.length - 1];
            },
          };
        }

        return {
          ok: true,
          async json() {
            return { items: movies };
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

test("submits published popular defaults for a new movie", async () => {
  const router = createMemoryRouter(routes, { initialEntries: ["/admin/movies"] });

  render(<RouterProvider router={router} />);

  fireEvent.change(await screen.findByLabelText(/标题/i), {
    target: { value: "新片" },
  });
  fireEvent.change(screen.getByLabelText(/年份/i), {
    target: { value: "2025" },
  });
  fireEvent.change(screen.getByLabelText(/评分/i), {
    target: { value: "8.7" },
  });
  fireEvent.change(screen.getByLabelText(/分类/i), {
    target: { value: "剧情" },
  });
  fireEvent.change(screen.getByLabelText(/简介/i), {
    target: { value: "测试简介" },
  });
  fireEvent.change(screen.getByLabelText(/外部链接/i), {
    target: { value: "https://example.com/new-movie" },
  });
  fireEvent.click(screen.getByRole("button", { name: /保存影视/i }));

  await waitFor(() => {
    const saveCall = vi
      .mocked(fetch)
      .mock.calls.find(
        ([input, init]) =>
          input === "/api/movies" &&
          (init?.method ?? "GET").toUpperCase() === "POST"
      );

    expect(saveCall).toBeDefined();
    const body = JSON.parse(String(saveCall?.[1]?.body ?? "{}")) as {
      status?: string;
      sections?: Array<{ sectionKey: string; sortOrder: number }>;
    };

    expect(body.status).toBe("published");
    expect(body.sections).toEqual([{ sectionKey: "popular", sortOrder: 0 }]);
  });
});
