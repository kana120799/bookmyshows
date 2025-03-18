"use client";

import { redirect, useParams, useSearchParams } from "next/navigation";
import CinemasByCity from "@/components/CinemaByCity";
import { useSelector } from "react-redux";
import { RootState } from "@/GlobalState/store";
import { useEffect, useState } from "react";
import SeatsSelection from "@/components/SeatsSelection";
import SelectedSeatsPanel from "@/components/SelectedSeatsPanel";
import Loader from "@/components/Loader";
import PaymentFormWrapper from "@/components/PaymentFormWrapper";
import axios from "axios";
import { useSession } from "next-auth/react";

export default function Page() {
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const { selectedCity } = useSelector((state: RootState) => state.city);
  const [showId, setShowId] = useState<string>("");
  const [lockSeat, setLockSeat] = useState<boolean>(false);
  const [isloading, setisloading] = useState<boolean>(false);
  const [showPayment, setShowPayment] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0);

  const [bookingKey, setBookingKey] = useState("");
  const [bookingData, setBookingData] = useState<
    {
      column: string;
      row: string;
      type: string;
      id: string;
      price: number;
    }[]
  >([]);
  const { id } = useParams<{ id: string }>();
  const validViews = ["slot", "seats"];
  const view = searchParams.get("view");
  const cinemaShowId = searchParams.get("showId");
  if (!view || !validViews.includes(view)) {
    setLockSeat(false);
    redirect(`/customer/${selectedCity.toLowerCase()}/movie/${id}`);
  }
  useEffect(() => {
    setLockSeat(false);
    if (showId !== "" && view === "slot") {
      redirect(
        `/customer/buyticket/${selectedCity.toLowerCase()}/movie/${id}?view=seats&showId=${showId}&userId=${
          session?.user?.id
        }`
      );
    }
  }, [showId, view, selectedCity, id, session?.user?.id]);

  useEffect(() => {
    async function LockSeat() {
      try {
        if (
          bookingData.reduce((sum, seat) => {
            return sum + (seat?.price || 0);
          }, 0) > 0 &&
          cinemaShowId
        ) {
          setisloading(true);

          const response = await axios.post(
            `/api/booking?selectedSeatIds=${bookingData
              .map((seat) => seat.id)
              .join(",")}&total=${bookingData.reduce((sum, seat) => {
              return sum + (seat?.price || 0);
            }, 0)}&showId=${cinemaShowId}&userId=${session?.user?.id}`
          );
          if (response.status === 200) {
            setBookingKey(response.data.data);
            setisloading(false);
          }
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        // alert("Data not Valid");
        alert(`Selected seats are no longer available`);
        redirect("/");
      }
    }
    LockSeat();
  }, [lockSeat, bookingData, session?.user?.id, cinemaShowId]);

  if (isloading) {
    return <Loader />;
  }

  return (
    <>
      {view === "slot" && (
        <>
          <CinemasByCity setShowId={setShowId} />
        </>
      )}
      {view === "seats" && !lockSeat && (
        <SeatsSelection
          selectedCity={selectedCity}
          id={id}
          setBookingData={setBookingData}
          setLockSeat={setLockSeat}
        />
      )}
      {view === "seats" && lockSeat && !showPayment && (
        <SelectedSeatsPanel
          seats={bookingData}
          setShowPayment={setShowPayment}
          selectedSeats={bookingData.map((seat) => seat.id)}
          setTotalAmount={setTotalAmount}
        />
      )}

      {view === "seats" && lockSeat && showPayment && (
        <PaymentFormWrapper
          // amount={bookingData.reduce((sum, seat) => {
          //   return sum + (seat?.price || 0);
          // }, 0)}
          amount={totalAmount}
          bookingKey={bookingKey}
          userId={session?.user?.id}
        />
      )}
    </>
  );
}
