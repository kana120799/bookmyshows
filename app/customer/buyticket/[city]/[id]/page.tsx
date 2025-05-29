"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import CinemasByCity from "@/components/CinemaByCity";
import { useSelector } from "react-redux";
import { RootState } from "@/GlobalState/store";
import { useEffect, useMemo, useState } from "react";
import SeatsSelection from "@/components/SeatsSelection";
import SelectedSeatsPanel from "@/components/SelectedSeatsPanel";
import { useSession } from "next-auth/react";
import React from "react";

const MemoizedCinemasByCity = React.memo(CinemasByCity);
const MemoizedSeatsSelection = React.memo(SeatsSelection);
const MemoizedSelectedSeatsPanel = React.memo(SelectedSeatsPanel);

export default function Page() {
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const router = useRouter();
  const { selectedCity } = useSelector((state: RootState) => state.city);
  const { id } = useParams<{ id: string }>();

  // State management
  const [showId, setShowId] = useState<string>("");
  const [lockSeat, setLockSeat] = useState<boolean>(false);
  // const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showPayment, setShowPayment] = useState<boolean>(false);
  const [tempBookId, setTempBookId] = useState<string>("");
  const [bookingData, setBookingData] = useState<
    { column: string; row: string; type: string; id: string; price: number }[]
  >([]);

  const view = searchParams.get("view");
  const validViews = ["slot", "seats"];

  if (!view || !validViews.includes(view)) {
    router.push(`/customer/${selectedCity.toLowerCase()}/movie/${id}`);
  }

  useEffect(() => {
    if (showId && view === "slot" && status === "authenticated") {
      router.push(
        `/customer/buyticket/${selectedCity.toLowerCase()}/${id}?view=seats&showId=${showId}&userId=${
          session?.user?.id
        }`
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, showId]);

  // const lockSeats = useCallback(async () => {
  //   if (
  //     !lockSeat ||
  //     !cinemaShowId ||
  //     bookingData.length === 0 ||
  //     status !== "authenticated"
  //   ) {
  //     return;
  //   }

  //   const total = bookingData.reduce(
  //     (sum, seat) => sum + (seat?.price || 0),
  //     0
  //   );
  //   if (total <= 0) return;

  //   try {
  //     setIsLoading(true);
  //     const lockResponse = await axios.post(
  //       `/api/booking?selectedSeatIds=${bookingData
  //         .map((seat) => seat.id)
  //         .join(",")}&total=${total}&showId=${cinemaShowId}&userId=${
  //         session?.user?.id
  //       }`
  //     );
  //     const { tempBookingId } = lockResponse.data.data;
  //     setTempBookId(tempBookingId);
  //     setIsLoading(false);
  //   } catch (error) {
  //     console.error("LockSeat error:", error);
  //     alert("Some seats are already reserved or unavailable");
  //     redirect("/");
  //   }
  // }, [lockSeat, bookingData, cinemaShowId, session?.user?.id, status]);

  // useEffect(() => {
  //   lockSeats();
  // }, [lockSeats]);

  const selectedSeats = useMemo(
    () => bookingData.map((seat) => seat.id),
    [bookingData]
  );

  // if (isLoading) {
  //   return <Loader />;
  // }

  return (
    <>
      {view === "slot" && <MemoizedCinemasByCity setShowId={setShowId} />}
      {view === "seats" && !lockSeat && (
        <MemoizedSeatsSelection
          selectedCity={selectedCity}
          id={id}
          setBookingData={setBookingData}
          setLockSeat={setLockSeat}
          setTempBookId={setTempBookId}
        />
      )}
      {view === "seats" && session && lockSeat && !showPayment && (
        <MemoizedSelectedSeatsPanel
          seats={bookingData}
          setShowPayment={setShowPayment}
          selectedSeats={selectedSeats}
          tempBookId={tempBookId}
          user={session.user}
          selectedCity={selectedCity}
          id={id}
          showId={showId}
        />
      )}
    </>
  );
}
