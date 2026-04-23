import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { vi } from "vitest";
import { routes } from "../../router";

beforeEach(() => {
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

      if (url.pathname === "/api/assets") {
        if ((init?.method ?? "GET").toUpperCase() === "POST") {
          return {
            ok: false,
            async json() {
              return { message: "File too large" };
            },
          };
        }

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

test("shows backend upload errors on the site assets page", async () => {
  const router = createMemoryRouter(routes, {
    initialEntries: ["/admin/site-assets"],
  });

  render(<RouterProvider router={router} />);

  const fileInput = (await screen.findByLabelText(/选择文件/i)) as HTMLInputElement;
  fireEvent.change(fileInput, {
    target: {
      files: [new File(["bundle"], "bundle.zip", { type: "application/zip" })],
    },
  });
  fireEvent.click(screen.getByRole("button", { name: /上传/i }));

  await waitFor(() => {
    expect(screen.getByText("File too large")).toBeInTheDocument();
  });
});
