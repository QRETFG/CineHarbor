import AssetUploadForm from "../components/AssetUploadForm";

export default function SiteAssetsPage() {
  return (
    <div className="space-y-6">
      <AssetUploadForm kind="site_asset" label="上传前端素材" />
    </div>
  );
}
