import { useNavigate } from "react-router-dom";

interface LoginInput {
  username: string;
  password: string;
}

export function useAdminSession() {
  const navigate = useNavigate();

  async function login(input: LoginInput) {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      throw new Error("登录失败");
    }

    navigate("/admin");
  }

  return { login };
}
