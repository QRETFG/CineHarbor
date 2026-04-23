import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AssetUploadForm from "../components/AssetUploadForm";

interface AssetItem {
  id: number;
  kind: string;
  originalName: string;
  publicUrl: string;
}

export default function AssetsPage() {
  const [assets, setAssets] = useState<AssetItem[]>([]);

  async function loadAssets() {
    const response = await fetch("/api/assets", { credentials: "include" });
    const data = (await response.json()) as { items: AssetItem[] };
    setAssets(data.items);
  }

  useEffect(() => {
    void loadAssets();
  }, []);

  return (
    <div className="space-y-6">
      <section className="sketch-border bg-surface p-5 shadow-sketch">
        <div className="flex items-center justify-between gap-4">
          <h1 className="font-hand text-3xl font-bold">素材库</h1>
          <Link
            className="sketch-border-thin bg-paper px-3 py-2 font-body"
            to="/admin/site-assets"
          >
            上传前端素材
          </Link>
        </div>
      </section>

      <AssetUploadForm
        kind="poster"
        label="上传海报素材"
        onUploaded={() => void loadAssets()}
      />

      <section className="sketch-border bg-surface p-5 shadow-sketch">
        <h2 className="font-hand text-2xl font-bold">已有素材</h2>
        <div className="mt-4 space-y-3">
          {assets.length === 0 ? (
            <p className="font-body text-pencil/60">暂无素材。</p>
          ) : (
            assets.map((asset) => (
              <article
                key={asset.id}
                className="sketch-border-thin bg-paper px-4 py-3"
              >
                <div className="font-body font-semibold">{asset.originalName}</div>
                <div className="font-body text-sm text-pencil/60">{asset.publicUrl}</div>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
