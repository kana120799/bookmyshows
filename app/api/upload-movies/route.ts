import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const MovieSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  Released: z.string().transform((val) => new Date(val)), //  ISO date string
  Year: z.number().int().min(1888).max(new Date().getFullYear()),
  Poster: z.string().url("Poster must be a valid URL"),
  Actors: z.array(z.string()).min(1, "At least one actor is required"),
  Director: z.array(z.string()).min(1, "At least one director is required"),
  durationMins: z.number().int().min(1, "Duration must be a positive integer"),
  language: z.string().min(1, "Language is required"),
  releaseDate: z.string().transform((val) => new Date(val)),
  country: z.string().min(1, "Country is required"),
  genre: z.array(z.string()).min(1, "At least one genre is required"),
  rating: z.number().min(0).max(10).optional().default(0.0),
});

type MovieInput = z.infer<typeof MovieSchema>;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    //  parse the JSON file
    const jsonText = await file.text();
    const jsonData: unknown = JSON.parse(jsonText);

    if (!Array.isArray(jsonData)) {
      return NextResponse.json(
        { error: "JSON must be an array of movies" },
        { status: 400 }
      );
    }

    // Validate movie entry
    const movies: MovieInput[] = jsonData?.map((item) => {
      const parsed = MovieSchema.safeParse(item);
      if (!parsed.success) {
        throw new Error(`Validation failed: ${parsed.error.message}`);
      }
      return parsed.data;
    });

    const result = await prisma.movie.createMany({
      data: movies?.map((movie) => ({
        // id: crypto.randomUUID(),
        title: movie.title,
        description: movie.description,
        Released: movie.Released,
        Year: movie.Year,
        Poster: movie.Poster,
        Actors: movie.Actors,
        Director: movie.Director,
        durationMins: movie.durationMins,
        language: movie.language,
        releaseDate: movie.releaseDate,
        country: movie.country,
        genre: movie.genre,
        rating: movie.rating,
      })),
      skipDuplicates: true, // Optional: Skip if a movie with the same ID exists
    });

    return NextResponse.json(
      { message: "Movies uploaded successfully", count: result.count },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error uploading movies:", error);
    return NextResponse.json(
      { error: "Failed to upload movies", details: String(error) },
      { status: 500 }
    );
  }
}
