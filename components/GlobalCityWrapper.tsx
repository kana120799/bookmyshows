"use client";
import { useSelector } from "react-redux";
import { RootState } from "@/GlobalState/store";
import CityPanel from "./Panel/CityPanel";

export default function GlobalCityWrapper() {
  const { showPannel } = useSelector((state: RootState) => state.city);

  return showPannel ? <CityPanel /> : <></>;
}
