import { useState } from "react";
import { useAdminSession } from "../hooks/useAdminSession";

export default function LoginPage() {
  const { login } = useAdminSession();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setError("");
      await login({ username, password });
    } catch (loginError) {
      setError(
        loginError instanceof Error ? loginError.message : "登录失败，请重试"
      );
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <section className="w-full max-w-md sketch-border bg-surface p-8 shadow-sketch">
        <h1 className="font-hand text-3xl font-bold">管理员登录</h1>
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="font-body text-sm font-semibold" htmlFor="username">
              用户名
            </label>
            <input
              id="username"
              className="w-full sketch-border-thin bg-paper px-3 py-2 font-body"
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="font-body text-sm font-semibold" htmlFor="password">
              密码
            </label>
            <input
              id="password"
              className="w-full sketch-border-thin bg-paper px-3 py-2 font-body"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>

          {error ? (
            <p className="font-body text-sm text-marker-red">{error}</p>
          ) : null}

          <button
            className="w-full sketch-border bg-sticky px-4 py-2 font-body font-semibold"
            type="submit"
          >
            登录
          </button>
        </form>
      </section>
    </main>
  );
}
