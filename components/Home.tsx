"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useDispatch } from "react-redux";
import { setSelectedCity } from "@/GlobalState/slices/citySlice";

export default function Home() {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "loading") return;
    console.log("session", session)
    // ADMIN redirect
    if (session?.user?.role === "ADMIN") {
      router.replace("/admin/cinema");
      return;
    }

    // Get city from URL
    const cityFromUrl = pathname.startsWith("/customer/home/")
      ? pathname.split("/")[3]
      : null;

    // Get city from localStorage
    const cityFromStorage =
      typeof window !== "undefined"
        ? localStorage.getItem("city")
        : null;

    // Final city decision
    const finalCity = cityFromUrl || cityFromStorage || "mumbai";

    // Sync redux + localStorage
    dispatch(setSelectedCity(finalCity));
    localStorage.setItem("city", finalCity);

    // Redirect root → city page
    if (pathname === "/") {
      router.replace(`/customer/home/${finalCity}`);
    }
  }, [status, pathname, session, router, dispatch]);

  // IMPORTANT: do NOT show Loader here
  return null;
}
