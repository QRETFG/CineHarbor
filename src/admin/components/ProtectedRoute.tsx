import { type ReactNode, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [state, setState] = useState<"loading" | "authorized" | "unauthorized">(
    "loading"
  );

  useEffect(() => {
    let active = true;

    void fetch("/api/auth/me", { credentials: "include" })
      .then((response) => {
        if (!active) return;
        setState(response.ok ? "authorized" : "unauthorized");
      })
      .catch(() => {
        if (active) {
          setState("unauthorized");
        }
      });

    return () => {
      active = false;
    };
  }, []);

  if (state === "loading") {
    return (
      <main className="min-h-screen flex items-center justify-center font-body text-pencil/60">
        正在验证登录状态...
      </main>
    );
  }

  if (state === "unauthorized") {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
}
