"use client";

import Loader from "@/components/Loader";
import { setSelectedCity } from "@/GlobalState/slices/citySlice";
import { RootState } from "@/GlobalState/store";
import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";

function useHasHydrated() {
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  return hasHydrated;
}

export default function Home() {
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const { selectedCity } = useSelector((state: RootState) => state.city);
  const { data: session, status } = useSession();
  const hasHydrated = useHasHydrated();

  const normalizeCityName = (city: string) => city.toLowerCase().trim();

  // memo city value
  const cityFromUrl = useMemo(() => {
    const city = pathname.split("/")[2];
    return city ? normalizeCityName(city) : null;
  }, [pathname]);

  const normalizedSelectedCity = useMemo(
    () => (selectedCity ? normalizeCityName(selectedCity) : null),
    [selectedCity]
  );

  useEffect(() => {
    if (!hasHydrated || status === "loading") return;

    if (session?.user.role === "ADMIN" && pathname === "/") {
      router.replace("/admin/cinema");
    }
  }, [hasHydrated, status, session, pathname, router]);

  // Handle city selection and redirection
  useEffect(() => {
    if (!hasHydrated || status === "loading") return;

    if (cityFromUrl && cityFromUrl !== normalizedSelectedCity) {
      dispatch(setSelectedCity(cityFromUrl));
    } else if (!cityFromUrl && normalizedSelectedCity) {
      router.replace(`/customer/home/${normalizedSelectedCity}`);
    }

    //  async data loading
    const loadingTimer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(loadingTimer);
  }, [
    hasHydrated,
    status,
    cityFromUrl,
    normalizedSelectedCity,
    dispatch,
    router,
  ]);

  if (!hasHydrated || status === "loading" || loading) {
    return <Loader />;
  }

return <Loader />;
  // return (
  //   <main className="flex items-center justify-center min-h-screen bg-gray-100">
  //     <h1 className="text-4xl font-bold text-[#FF5555] animate-fade-in-scale">
  //       Welcome to the Cinema
  //     </h1>
  //   </main>
  // );
}
