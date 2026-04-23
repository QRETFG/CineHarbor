import { useState } from "react";

interface AssetUploadFormProps {
  kind: "poster" | "backdrop" | "site_asset";
  label: string;
  onUploaded?: () => void;
}

export default function AssetUploadForm({
  kind,
  label,
  onUploaded,
}: AssetUploadFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!file) {
      setMessage("请选择文件");
      return;
    }

    const formData = new FormData();
    formData.append("kind", kind);
    formData.append("file", file);

    const response = await fetch("/api/assets", {
      method: "POST",
      credentials: "include",
      body: formData,
    });

    if (!response.ok) {
      setMessage("上传失败");
      return;
    }

    const asset = (await response.json()) as { publicUrl: string };
    setMessage(`上传成功：${asset.publicUrl}`);
    setFile(null);
    onUploaded?.();
  }

  return (
    <form className="space-y-4 sketch-border bg-surface p-5 shadow-sketch" onSubmit={handleSubmit}>
      <h2 className="font-hand text-2xl font-bold">{label}</h2>
      <input
        className="block w-full font-body"
        onChange={(event) => setFile(event.target.files?.[0] ?? null)}
        type="file"
      />
      <button
        className="sketch-border bg-sticky px-4 py-2 font-body font-semibold"
        type="submit"
      >
        上传
      </button>
      {message ? <p className="font-body text-sm text-pencil/70">{message}</p> : null}
    </form>
  );
}
