import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import HomePage from "../pages/HomePage";

const moviesBySection = {
  featured: [
    {
      id: 1,
      title: "接口精选片",
      year: 2024,
      rating: 9.1,
      genre: "科幻",
      description: "来自接口的精选影片",
      poster: "/uploads/posters/featured.jpg",
      backdrop: "",
      url: "https://example.com/featured",
      status: "published",
    },
  ],
  popular: [
    {
      id: 2,
      title: "接口热门片",
      year: 2023,
      rating: 8.8,
      genre: "剧情",
      description: "来自接口的热门影片",
      poster: "/uploads/posters/popular.jpg",
      backdrop: "",
      url: "https://example.com/popular",
      status: "published",
    },
  ],
  recommended: [
    {
      id: 3,
      title: "接口推荐片",
      year: 2022,
      rating: 9.4,
      genre: "动画",
      description: "来自接口的推荐影片",
      poster: "/uploads/posters/recommended.jpg",
      backdrop: "",
      url: "https://example.com/recommended",
      status: "published",
    },
  ],
} as const;

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
      const section = (url.searchParams.get("section") ?? "popular") as keyof typeof moviesBySection;

      return {
        ok: true,
        async json() {
          return { items: moviesBySection[section] };
        },
      };
    })
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});

test("renders featured and recommended movies from the api", async () => {
  render(<HomePage />);

  expect(await screen.findByText("接口精选片")).toBeInTheDocument();
  expect(await screen.findByText("接口推荐片")).toBeInTheDocument();
  expect(fetch).toHaveBeenCalled();
});
