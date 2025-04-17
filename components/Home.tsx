"use client";

import Loader from "@/components/Loader";
import { setSelectedCity } from "@/GlobalState/slices/citySlice";
import { RootState } from "@/GlobalState/store";
import { useSession } from "next-auth/react";
import { redirect, usePathname } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";

export default function Home() {
  const dispatch = useDispatch();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const { selectedCity } = useSelector((state: RootState) => state.city);
  const { data: session } = useSession();

  const normalizeCityName = useCallback(
    (city: string) => city.toLowerCase().trim(),
    []
  );

  useEffect(() => {
    const cityFromUrl = pathname.split("/")[2];
    const normalizedCityFromUrl = cityFromUrl
      ? normalizeCityName(cityFromUrl)
      : null;
    const normalizedSelectedCity = selectedCity
      ? normalizeCityName(selectedCity)
      : null;

    if (session?.user.role === "ADMIN" && pathname === "/") {
      redirect("/admin/cinema");
    }

    if (
      normalizedCityFromUrl &&
      normalizedCityFromUrl !== normalizedSelectedCity
    ) {
      dispatch(setSelectedCity(normalizedCityFromUrl));
    } else if (!normalizedCityFromUrl && normalizedSelectedCity) {
      redirect(`/customer/home/${normalizedSelectedCity}`);
    }

    const loadingTimer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(loadingTimer);
  }, [pathname, selectedCity, dispatch, session, normalizeCityName]);

  if (loading) {
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
