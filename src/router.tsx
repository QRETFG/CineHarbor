import { createBrowserRouter, type RouteObject } from "react-router-dom";
import LoginPage from "./admin/pages/LoginPage";
import HomePage from "./pages/HomePage";

export const routes: RouteObject[] = [
  {
    path: "/",
    element: <HomePage />,
  },
  {
    path: "/admin/login",
    element: <LoginPage />,
  },
];

export const router = createBrowserRouter(routes);
