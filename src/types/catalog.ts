export interface Movie {
  id: number;
  title: string;
  year: number;
  rating: number;
  genre: string;
  description: string;
  poster: string;
  backdrop: string;
  url: string;
  status?: string;
  posterAssetId?: number | null;
  backdropAssetId?: number | null;
  sections?: MovieSectionKey[];
}

export interface SharedWebsite {
  id: number;
  title: string;
  tag: string;
  description: string;
  url: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  count: number;
}

export type MovieSectionKey = "featured" | "popular" | "recommended";
