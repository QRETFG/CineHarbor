import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LoginPage from "../pages/LoginPage";

test("renders username and password inputs", () => {
  render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>
  );

  expect(screen.getByLabelText(/用户名/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/密码/i)).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /登录/i })).toBeInTheDocument();
});
