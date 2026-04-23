import { createBrowserRouter, type RouteObject } from "react-router-dom";
import AdminShell from "./admin/components/AdminShell";
import ProtectedRoute from "./admin/components/ProtectedRoute";
import AssetsPage from "./admin/pages/AssetsPage";
import DashboardPage from "./admin/pages/DashboardPage";
import LoginPage from "./admin/pages/LoginPage";
import MoviesPage from "./admin/pages/MoviesPage";
import SiteAssetsPage from "./admin/pages/SiteAssetsPage";
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
  {
    path: "/admin",
    element: (
      <ProtectedRoute>
        <AdminShell />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: "movies",
        element: <MoviesPage />,
      },
      {
        path: "assets",
        element: <AssetsPage />,
      },
      {
        path: "site-assets",
        element: <SiteAssetsPage />,
      },
    ],
  },
];

export const router = createBrowserRouter(routes);
