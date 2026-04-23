import type { Movie, MovieSectionKey } from "../../types/catalog";

interface AssetOption {
  id: number;
  kind: string;
  originalName: string;
}

export interface MovieFormValues {
  title: string;
  year: string;
  rating: string;
  genre: string;
  description: string;
  url: string;
  status: string;
  posterAssetId: string;
  backdropAssetId: string;
  sections: MovieSectionKey[];
}

interface MovieFormProps {
  assets: AssetOption[];
  values: MovieFormValues;
  onChange: (nextValues: MovieFormValues) => void;
  onSubmit: () => void;
  submitLabel?: string;
  editingMovie?: Movie | null;
}

const sectionOptions: Array<{ label: string; value: MovieSectionKey }> = [
  { label: "精选轮播", value: "featured" },
  { label: "热门列表", value: "popular" },
  { label: "推荐区", value: "recommended" },
];

export default function MovieForm({
  assets,
  values,
  onChange,
  onSubmit,
  submitLabel = "保存影视",
  editingMovie,
}: MovieFormProps) {
  function toggleSection(section: MovieSectionKey) {
    const nextSections = values.sections.includes(section)
      ? values.sections.filter((value) => value !== section)
      : [...values.sections, section];

    onChange({ ...values, sections: nextSections });
  }

  return (
    <section className="sketch-border bg-surface p-5 shadow-sketch">
      <h2 className="font-hand text-2xl font-bold">
        {editingMovie ? "编辑影视" : "新建影视"}
      </h2>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <label className="font-body text-sm">
          <span className="mb-2 block font-semibold">标题</span>
          <input
            className="w-full sketch-border-thin bg-paper px-3 py-2"
            value={values.title}
            onChange={(event) =>
              onChange({ ...values, title: event.target.value })
            }
          />
        </label>

        <label className="font-body text-sm">
          <span className="mb-2 block font-semibold">年份</span>
          <input
            className="w-full sketch-border-thin bg-paper px-3 py-2"
            value={values.year}
            onChange={(event) => onChange({ ...values, year: event.target.value })}
          />
        </label>

        <label className="font-body text-sm">
          <span className="mb-2 block font-semibold">评分</span>
          <input
            className="w-full sketch-border-thin bg-paper px-3 py-2"
            value={values.rating}
            onChange={(event) =>
              onChange({ ...values, rating: event.target.value })
            }
          />
        </label>

        <label className="font-body text-sm">
          <span className="mb-2 block font-semibold">分类</span>
          <input
            className="w-full sketch-border-thin bg-paper px-3 py-2"
            value={values.genre}
            onChange={(event) =>
              onChange({ ...values, genre: event.target.value })
            }
          />
        </label>

        <label className="font-body text-sm md:col-span-2">
          <span className="mb-2 block font-semibold">简介</span>
          <textarea
            className="min-h-28 w-full sketch-border-thin bg-paper px-3 py-2"
            value={values.description}
            onChange={(event) =>
              onChange({ ...values, description: event.target.value })
            }
          />
        </label>

        <label className="font-body text-sm md:col-span-2">
          <span className="mb-2 block font-semibold">外部链接</span>
          <input
            className="w-full sketch-border-thin bg-paper px-3 py-2"
            value={values.url}
            onChange={(event) => onChange({ ...values, url: event.target.value })}
          />
        </label>

        <label className="font-body text-sm">
          <span className="mb-2 block font-semibold">发布状态</span>
          <select
            className="w-full sketch-border-thin bg-paper px-3 py-2"
            value={values.status}
            onChange={(event) => onChange({ ...values, status: event.target.value })}
          >
            <option value="draft">草稿</option>
            <option value="published">已发布</option>
          </select>
        </label>

        <fieldset className="font-body text-sm">
          <legend className="mb-2 block font-semibold">首页区块</legend>
          <div className="space-y-2">
            {sectionOptions.map((section) => (
              <label key={section.value} className="flex items-center gap-2">
                <input
                  checked={values.sections.includes(section.value)}
                  onChange={() => toggleSection(section.value)}
                  type="checkbox"
                />
                <span>{section.label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <label className="font-body text-sm">
          <span className="mb-2 block font-semibold">海报素材</span>
          <select
            className="w-full sketch-border-thin bg-paper px-3 py-2"
            value={values.posterAssetId}
            onChange={(event) =>
              onChange({ ...values, posterAssetId: event.target.value })
            }
          >
            <option value="">不选择</option>
            {assets
              .filter((asset) => asset.kind === "poster")
              .map((asset) => (
                <option key={asset.id} value={asset.id}>
                  {asset.originalName}
                </option>
              ))}
          </select>
        </label>

        <label className="font-body text-sm">
          <span className="mb-2 block font-semibold">背景素材</span>
          <select
            className="w-full sketch-border-thin bg-paper px-3 py-2"
            value={values.backdropAssetId}
            onChange={(event) =>
              onChange({ ...values, backdropAssetId: event.target.value })
            }
          >
            <option value="">不选择</option>
            {assets
              .filter((asset) => asset.kind === "backdrop")
              .map((asset) => (
                <option key={asset.id} value={asset.id}>
                  {asset.originalName}
                </option>
              ))}
          </select>
        </label>
      </div>

      <button
        className="mt-5 sketch-border bg-sticky px-4 py-2 font-body font-semibold"
        onClick={onSubmit}
        type="button"
      >
        {submitLabel}
      </button>
    </section>
  );
}
