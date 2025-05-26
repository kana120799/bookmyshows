"use client";

import Loader from "@/components/Loader";
import { setSelectedCity } from "@/GlobalState/slices/citySlice";
import { RootState } from "@/GlobalState/store";
import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";

export default function Home() {
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const { selectedCity } = useSelector((state: RootState) => state.city);
  const { data: session, status } = useSession();

  const normalizeCityName = useCallback(
    (city: string) => city.toLowerCase().trim(),
    []
  );

  useEffect(() => {
    // Waiting for session status to resolve and hydration to complete.
    if (status === "loading") return;

    const cityFromUrl = pathname.split("/")[2];
    const normalizedCityFromUrl = cityFromUrl
      ? normalizeCityName(cityFromUrl)
      : null;
    const normalizedSelectedCity = selectedCity
      ? normalizeCityName(selectedCity)
      : null;
    console.log(
      session,
      "==>>",
      session?.user.role === "ADMIN",
      pathname,
      pathname === "/"
    );
    if (session?.user.role === "ADMIN" && pathname === "/") {
      router.push("/admin/cinema");
      return;
    }

    if (
      normalizedCityFromUrl &&
      normalizedCityFromUrl !== normalizedSelectedCity
    ) {
      dispatch(setSelectedCity(normalizedCityFromUrl));
    } else if (!normalizedCityFromUrl && normalizedSelectedCity) {
      router.push(`/customer/home/${normalizedSelectedCity}`);
    }

    // Set loading to false after a short delay to ensure rendering stability
    const loadingTimer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(loadingTimer);
  }, [
    pathname,
    selectedCity,
    dispatch,
    session,
    status,
    normalizeCityName,
    router,
  ]);

  if (status === "loading" || loading) {
    return <Loader />;
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Welcome to BookMyShow!</h1>
      {selectedCity ? (
        <p className="text-lg font-semibold">Selected City: {selectedCity}</p>
      ) : (
        <p className="text-lg font-semibold">No city selected yet.</p>
      )}
    </main>
  );
}
