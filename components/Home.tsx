"use client";

import Loader from "@/components/Loader";
import { setSelectedCity } from "@/GlobalState/slices/citySlice";
import { RootState } from "@/GlobalState/store";
import { useSession } from "next-auth/react";
import { redirect, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

export default function Home() {
  const dispatch = useDispatch();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const { selectedCity } = useSelector((state: RootState) => state.city);
  const { data: session } = useSession();

  useEffect(() => {
    const cityFromUrl = pathname.split("/")[2]?.toLowerCase();
    if (session) {
      if (pathname === "/" && session?.user.role === "ADMIN") {
        redirect(`/admin/cinema`);
      }
    }
    if (cityFromUrl && cityFromUrl !== selectedCity.toLowerCase()) {
      dispatch(setSelectedCity(cityFromUrl.toLowerCase()));
    }

    if (!cityFromUrl && selectedCity) {
      dispatch(setSelectedCity(selectedCity.toLowerCase()));
      redirect(`/customer/home/${selectedCity.toLowerCase()}`);
    }
    setTimeout(() => setLoading(false), 1000);
  }, [pathname, selectedCity, dispatch, session?.user.role, session]);

  if (loading) {
    return <Loader />;
  }

  return (
    <div>
      <h1>Welcome to the BookMyShow !</h1>
      {selectedCity ? (
        <p>Selected City: {selectedCity}</p>
      ) : (
        <p>No city selected yet.</p>
      )}
    </div>
  );
}
