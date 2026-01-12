import MovieList from "@/components/MovieList";
import CityPanel from "@/components/Panel/CityPanel";
import ShowMovieList from "@/components/ShowMovieList";
import CityPannelWrapper from "./Panel/CityPannelWrapper";

export default function CustomerCinema() {
  return (
    <>
      <CityPannelWrapper>
        <CityPanel />
      </CityPannelWrapper>
      <ShowMovieList />
      <MovieList />
    </>
  );
}
