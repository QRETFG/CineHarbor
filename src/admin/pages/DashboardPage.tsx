import { useEffect, useState } from "react";

interface DashboardData {
  movieCount: number;
  assetCount: number;
  recentUploads: unknown[];
  recentMovies: unknown[];
}

const emptyDashboard: DashboardData = {
  movieCount: 0,
  assetCount: 0,
  recentUploads: [],
  recentMovies: [],
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData>(emptyDashboard);

  useEffect(() => {
    let active = true;

    void fetch("/api/admin/dashboard", { credentials: "include" })
      .then(async (response) => {
        if (!response.ok || !active) return;
        setData((await response.json()) as DashboardData);
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="grid gap-4 md:grid-cols-2">
      <div className="sketch-border bg-surface p-5 shadow-sketch">
        <h1 className="font-hand text-3xl font-bold">后台仪表盘</h1>
        <p className="mt-2 font-body text-pencil/60">这里展示后台核心数据概览。</p>
      </div>
      <div className="sketch-border bg-surface p-5 shadow-sketch">
        <div className="font-body text-sm text-pencil/60">影视数量</div>
        <div className="mt-2 font-hand text-4xl font-bold">{data.movieCount}</div>
      </div>
      <div className="sketch-border bg-surface p-5 shadow-sketch">
        <div className="font-body text-sm text-pencil/60">素材数量</div>
        <div className="mt-2 font-hand text-4xl font-bold">{data.assetCount}</div>
      </div>
    </section>
  );
}
