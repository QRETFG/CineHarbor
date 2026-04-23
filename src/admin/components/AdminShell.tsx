import { Link, Outlet } from "react-router-dom";

export default function AdminShell() {
  return (
    <div className="min-h-screen bg-paper">
      <div className="mx-auto flex max-w-6xl gap-6 px-4 py-6 lg:px-6">
        <aside className="w-64 shrink-0 sketch-border bg-surface p-5 shadow-sketch">
          <div className="font-hand text-2xl font-bold">CineHarbor Admin</div>
          <nav className="mt-6 flex flex-col gap-3 font-body">
            <Link className="sketch-border-thin bg-paper px-3 py-2" to="/admin">
              仪表盘
            </Link>
            <Link
              className="sketch-border-thin bg-paper px-3 py-2"
              to="/admin/movies"
            >
              影视管理
            </Link>
            <Link
              className="sketch-border-thin bg-paper px-3 py-2"
              to="/admin/assets"
            >
              素材管理
            </Link>
          </nav>
        </aside>

        <main className="min-w-0 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
