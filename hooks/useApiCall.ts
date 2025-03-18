"use client";
import { useState, useEffect, useCallback } from "react";

// Define the shape of the API response (customize this based on your API)
interface ApiResponse<T = unknown> {
  data: T;
  status: string;
  message?: string;
}

// Options for the fetch request
interface FetchOptions {
  method: string;
  headers: Record<string, string>;
  body?: string;
}

/**
 * Custom hook to handle API calls
 * @template T - Type of the API response data
 * @param url - The API endpoint URL
 * @param method - HTTP method ("GET", "POST", etc.)
 * @param initialBody - Optional initial request body (e.g., for POST/PUT requests)
 * @param headers - Optional custom headers
 * @returns - { data, loading, error, trigger }
 */
export function useApiCall<T>(
  url: string,
  method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
  initialBody: object | null = null,
  headers: Record<string, string> = {}
): {
  data: T | null;
  loading: boolean;
  error: string | null;
  trigger: (body?: object | null) => Promise<T>;
} {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const trigger = useCallback(
    async (body: object | null = initialBody): Promise<T> => {
      setLoading(true);
      setError(null);

      try {
        const options: FetchOptions = {
          method,
          headers: {
            "Content-Type": "application/json",
            ...headers,
          },
        };

        if (body && (method === "POST" || method === "PUT")) {
          options.body = JSON.stringify(body);
        }

        const response = await fetch(url, options);

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const result: ApiResponse<T> = await response.json();
        setData(result.data);
        return result.data;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Something went wrong";
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [url, method, headers, initialBody]
  );

  useEffect(() => {
    if (method === "GET" && url) {
      trigger();
    }
  }, [method, url, trigger]);

  return { data, loading, error, trigger };
}
