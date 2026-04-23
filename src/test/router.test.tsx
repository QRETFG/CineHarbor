// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { routes } from "../router";

test("renders the admin login route", async () => {
  const router = createMemoryRouter(routes, {
    initialEntries: ["/admin/login"],
  });

  render(<RouterProvider router={router} />);

  expect(
    await screen.findByRole("heading", { name: /管理员登录/i })
  ).toBeInTheDocument();
});
