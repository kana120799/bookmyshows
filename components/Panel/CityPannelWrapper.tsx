"use client";
import React from "react";
import { RootState } from "@/GlobalState/store";

import { useSelector } from "react-redux";

function CityPannelWrapper({ children }: { children: React.ReactNode }) {
  const { showPannel } = useSelector((state: RootState) => state.city);

  return <>{showPannel && children}</>;
}

export default CityPannelWrapper;
