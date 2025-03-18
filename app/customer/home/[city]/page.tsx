"use client";
import MovieList from "@/components/MovieList";
import CityPanel from "@/components/Panel/CityPanel";
import ShowMovieList from "@/components/ShowMovieList";
import { RootState } from "@/GlobalState/store";

import { useSelector } from "react-redux";

export default function Home() {
  const { showPannel } = useSelector((state: RootState) => state.city);

  return (
    <>
      {/* // Todo:  we can remove this.  yes by GlobalCityWrapper component do it later   */}
      {showPannel && <CityPanel />}
      <ShowMovieList />
      <MovieList />
    </>
  );
}
