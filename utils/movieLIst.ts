"use server";

interface MovieQueryParams {
  page: string | number;
  limit: string | number;
  genre: string;
  language: string;
  search: string;
}

export async function fetchMoviesList(
  params: MovieQueryParams
): Promise<Response> {
  const queryParams = new URLSearchParams({
    page: params.page.toString(),
    limit: params.limit.toString(),
    genre: params.genre,
    language: params.language,
    search: params.search,
  }).toString();

  return await fetch(`/api/movie?${queryParams}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    next: { revalidate: 10 * 60 * 60 },
  });
}
