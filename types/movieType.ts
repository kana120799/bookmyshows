export interface MovieType {
  id?: string;
  title: string;
  description: string;
  Released: Date | string;
  Year: number;
  Poster: string;
  Actors: string[];
  Director: string[];
  durationMins: number;
  language: string;
  releaseDate: Date | string;
  country: string;
  genre: string[];
  rating?: number;
}

export interface MovieFilters {
  OR?: Array<{
    title?: { contains: string; mode: "insensitive" };
    description?: { contains: string; mode: "insensitive" };
  }>;
  language?: { equals: string; mode: "insensitive" };
  genre?: { has: string };
}
